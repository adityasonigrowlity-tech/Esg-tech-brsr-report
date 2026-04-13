import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { PyData, DEFAULT_PY_DATA } from "@/features/brsr/types";

export const runtime = "nodejs";

// ─── LLM CONFIG ───────────────────────────────────────────────────────────────

const CHUTES_URL = "https://llm.chutes.ai/v1/chat/completions";
const API_KEY = process.env.CHUTES_API_KEY || "";

const EXTRACTION_MODELS = [
  "Qwen/Qwen3-235B-A22B-Instruct-2507-TEE",
  "openai/gpt-oss-120b-TEE",
  "deepseek-ai/DeepSeek-V3-0324",
  "zai-org/GLM-4.7-TEE",
];

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface PdfData { pages: any[]; fullText: string }

interface DetectedYears {
  col1Year: string;  // First column year
  col2Year: string;  // Second column year
  extractCol: number; // Which column to extract (1 or 2)
}

// ─── PDF WORKER ───────────────────────────────────────────────────────────────

async function extractPdf(buffer: Buffer): Promise<PdfData> {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(process.cwd(), "pdf-worker.cjs");
    const child = spawn("node", [workerPath]);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    child.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    const timer = setTimeout(() => { child.kill(); reject(new Error("PDF extraction timeout (120s)")); }, 120_000);

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 || !stdout.trim()) { 
        console.error("[parse-pdf] Worker error:", stderr);
        reject(new Error(stderr || `Worker exit ${code}`)); 
        return; 
      }
      try { 
        const result = JSON.parse(stdout);
        console.log(`[parse-pdf] Extracted ${result.pages?.length || 0} pages, ${result.fullText?.length || 0} chars`);
        resolve(result); 
      } catch { 
        reject(new Error("Invalid JSON from worker")); 
      }
    });

    child.stdin.write(buffer);
    child.stdin.end();
  });
}

// ─── LLM CALL WITH FALLBACK ───────────────────────────────────────────────────

async function callLLM(prompt: string, model: string): Promise<Record<string, any>> {
  const resp = await fetch(CHUTES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Model ${model} returned ${resp.status}: ${err}`);
  }
  
  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  return {};
}

async function callLLMWithFallback(prompt: string, sectionTitle: string): Promise<Record<string, any>> {
  let lastError = "All models unavailable";
  for (const model of EXTRACTION_MODELS) {
    try {
      console.log(`[parse-pdf] [${sectionTitle}] Using model: ${model}`);
      return await callLLM(prompt, model);
    } catch (e: any) {
      console.warn(`[parse-pdf] [${sectionTitle}] Model ${model} failed: ${e.message}`);
      lastError = e.message;
    }
  }
  throw new Error(lastError);
}

// ─── SECTION EXTRACTION ────────────────────────────────────────────────────────

function extractSection(text: string, keywords: string[], linesBefore: number = 5, linesAfter: number = 300): string {
  const lines = text.split("\n");
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    const idx = lowerText.indexOf(keyword.toLowerCase());
    if (idx !== -1) {
      let lineIdx = 0;
      let charCount = 0;
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1;
        if (charCount >= idx) { lineIdx = i; break; }
      }
      const start = Math.max(0, lineIdx - linesBefore);
      const end = Math.min(lines.length, lineIdx + linesAfter);
      return lines.slice(start, end).join("\n");
    }
  }
  return "";
}

// ─── SAFE MERGE (REPLACES OBJECT SPREAD) ─────────────────────────────────────

function safeMerge(base: Record<string, any>, extra: Record<string, any>): Record<string, any> {
  const result = { ...base };

  for (const key in extra) {
    const val = extra[key];
    if (
      val !== null &&
      val !== undefined &&
      val !== "" &&
      !(typeof val === "number" && isNaN(val))
    ) {
      result[key] = val;
    }
  }

  return result;
}

// ─── YEAR AUTO-DETECTION ────────────────────────────────────────────────────────

function detectYearsFromPdf(text: string): DetectedYears {
  // Common BRSR year patterns
  const yearPatterns = [
    /FY\s*(\d{4})\s*[-–]\s*(\d{2})/gi,  // FY2024-25
    /FY\s*(\d{2})\s*[-–]\s*(\d{2})/gi,   // FY24-25
    /(\d{4})\s*[-–]\s*(\d{2})/gi,        // 2024-25
  ];

  const foundYears: string[] = [];

  for (const pattern of yearPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[2]) {
        const year1 = match[1].length === 4 ? match[1] : "20" + match[1];
        const year2 = match[1].length === 4 ? match[1].slice(0, 2) + match[2] : match[2];
        const fullYear1 = year1.length === 4 ? year1 : "20" + year1;
        const fullYear2 = fullYear1.slice(0, 2) + year2;
        const yearStr = `${fullYear1}-${fullYear2.slice(-2)}`;
        if (!foundYears.includes(yearStr)) {
          foundYears.push(yearStr);
        }
      }
    }
  }

  // Default to common BRSR format if not detected
  if (foundYears.length < 2) {
    console.log("[parse-pdf] Year detection: Using defaults FY2024-25 (col1), FY2023-24 (col2)");
    return {
      col1Year: "FY2024-25",
      col2Year: "FY2023-24",
      extractCol: 2 // Extract second column (previous year)
    };
  }

  // Sort years to determine column order
  foundYears.sort();
  console.log(`[parse-pdf] Detected years: ${foundYears.join(", ")}`);

  // First year in sorted list = older = second column (PY)
  // Last year in sorted list = newer = first column (CY)
  const col2Year = foundYears[0]; // Older year = PY
  const col1Year = foundYears[foundYears.length - 1]; // Newer year = CY

  // Default: Extract Previous Year (older/second column)
  return {
    col1Year,
    col2Year,
    extractCol: 2 // Extract second column (previous year)
  };
}

// ─── REGEX FALLBACK EXTRACTORS ────────────────────────────────────────────────

function extractNumberAfterLabel(text: string, label: string, maxDistance: number = 80): number {
  const escaped = label.replace(/[()]/g, "\\$&");
  const regex = new RegExp(escaped + "[\\s\\S]{0," + maxDistance + "}?(\\d{1,7})", "i");
  const match = text.match(regex);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
}

function extractFirstColumn(text: string, label: string): number {
  const escaped = label.replace(/[()]/g, "\\$&");
  const numPattern = "(\\d{1,3}(?:,\\d{3})*|\\d+)";
  const regex = new RegExp(escaped + "[\\s\\S]{0,80}?" + numPattern + "\\s+" + numPattern, "i");
  const match = text.match(regex);
  if (!match) return 0;
  return parseFloat(match[1].replace(/,/g, ""));
}

function extractSecondColumn(text: string, label: string): number {
  const escaped = label.replace(/[()]/g, "\\$&");
  const numPattern = "(\\d{1,3}(?:,\\d{3})*|\\d+)";
  const regex = new RegExp(escaped + "[\\s\\S]{0,80}?" + numPattern + "\\s+" + numPattern, "i");
  const match = text.match(regex);
  if (!match) return 0;
  return parseFloat(match[2].replace(/,/g, ""));
}

function extractDecimalAfterLabel(text: string, label: string): number {
  const escaped = label.replace(/[()]/g, "\\$&");
  const regex = new RegExp(escaped + "[\\s\\S]{0,60}?(\\d+\\.?\\d*)", "i");
  const match = text.match(regex);
  return match ? parseFloat(match[1]) : 0;
}

function extractPercentageAfterLabel(text: string, label: string): number {
  const escaped = label.replace(/[()]/g, "\\$&");
  // Support: 100%, 100% (with % symbol) OR 100 (no symbol needed)
  const regex = new RegExp(escaped + "[\\s\\S]{0,100}?(\\d{1,3})(?:%|\\s|$)", "i");
  const match = text.match(regex);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  // Valid percentage range (1-100)
  return (val >= 1 && val <= 100) ? val : 0;
}

function extractLTIFR(text: string): { employees: number; workers: number } {
  const empMatch = text.match(/Employees[\s\\S]{0,100}?(\d+\.?\d*)/i);
  const workerMatch = text.match(/Workers[\s\\S]{0,100}?(\d+\.?\d*)/i);
  return {
    employees: empMatch ? parseFloat(empMatch[1]) : 0,
    workers: workerMatch ? parseFloat(workerMatch[1]) : 0,
  };
}

// ─── POST-PROCESSING LAYER (with fallback extraction) ──────────────────────────

// Smart fallback rule - P3 fields should NOT be 0 in valid BRSR
function shouldFallbackP3(value: number | undefined, field: string): boolean {
  const nonZeroFields = ['p3_iso_45001', 'p3_assess_health', 'p3_assess_working'];
  return nonZeroFields.includes(field) && (value === undefined || value === 0);
}

function postProcess(data: Record<string, any>, text: string, yearInfo: DetectedYears): Record<string, any> {
  const result = { ...data };

  // Add detected year info
  result.detectedYears = yearInfo;

  // Fix intensity scale (if too small, multiply to get reasonable value)
  if (result.intensity !== undefined && result.intensity > 0 && result.intensity < 1) {
    result.intensity = result.intensity * 1_000_000;
  }

  // ─── Map LLM fields → UI fields ───────────────────────────────────────────
  if (result.p3_iso_45001 !== undefined) {
    result.p3_iso_45001_percent = result.p3_iso_45001;
  }
  if (result.p3_assess_health !== undefined) {
    result.p3_assessment_hs_percent = result.p3_assess_health;
  }
  if (result.p3_assess_working !== undefined) {
    result.p3_assessment_wc_percent = result.p3_assess_working;
  }

  // P3 Safety - Smart fallback with flexible regex matching
  if (shouldFallbackP3(result.p3_iso_45001, 'p3_iso_45001')) {
    const extracted = extractPercentageAfterLabel(text, "ISO 45001");
    if (extracted > 0) {
      result.p3_iso_45001 = extracted;
      result.p3_iso_45001_percent = extracted;
    }
  }
  
  if (shouldFallbackP3(result.p3_assess_health, 'p3_assess_health')) {
    // Flexible matching for "health and safety practices"
    let extracted = extractPercentageAfterLabel(text, "health.*safety.*practices");
    if (!extracted) extracted = extractPercentageAfterLabel(text, "health and safety");
    if (!extracted) extracted = extractPercentageAfterLabel(text, "safety.*practices");
    if (extracted > 0) {
      result.p3_assess_health = extracted;
      result.p3_assessment_hs_percent = extracted;
    }
  }
  
  if (shouldFallbackP3(result.p3_assess_working, 'p3_assess_working')) {
    // Flexible matching for "working conditions assessment"
    let extracted = extractPercentageAfterLabel(text, "working conditions.*assessment");
    if (!extracted) extracted = extractPercentageAfterLabel(text, "working conditions");
    if (!extracted) extracted = extractPercentageAfterLabel(text, "conditions.*assessment");
    if (extracted > 0) {
      result.p3_assess_working = extracted;
      result.p3_assessment_wc_percent = extracted;
    }
  }

  // LTIFR - Extract from table
  const ltifr = extractLTIFR(text);
  if (result.p3_ltifr === undefined || result.p3_ltifr === 0) {
    result.p3_ltifr = ltifr.employees || ltifr.workers || 0;
  }

  // Water Discharge - Fallback extraction (using detected year column)
  const extractWD = yearInfo.extractCol === 1 ? extractFirstColumn : extractSecondColumn;
  
  if (result.wd_surface_tx === undefined || result.wd_surface_tx === 0) {
    result.wd_surface_tx = extractWD(text, "Surface.*With treatment");
  }
  if (result.wd_ground_notx === undefined || result.wd_ground_notx === 0) {
    result.wd_ground_notx = extractWD(text, "Groundwater.*No treatment");
  }
  if (result.wd_third_notx === undefined || result.wd_third_notx === 0) {
    result.wd_third_notx = extractWD(text, "third parties.*No treatment");
  }
  if (result.wd_others_tx === undefined || result.wd_others_tx === 0) {
    result.wd_others_tx = extractWD(text, "Others.*Tertiary");
  }

  // Sanity check for GHG values (BRSR values should be in thousands+)
  if (result.ghg_scope1 !== undefined && result.ghg_scope1 > 0 && result.ghg_scope1 < 1000) {
    result.ghg_scope1 = result.ghg_scope1 * 1000;
  }
  if (result.ghg_scope2 !== undefined && result.ghg_scope2 > 0 && result.ghg_scope2 < 1000) {
    result.ghg_scope2 = result.ghg_scope2 * 1000;
  }

  // Ensure energy totals make sense (should be in lakhs for large orgs)
  if (result.total_energy !== undefined && result.total_energy > 0 && result.total_energy < 100) {
    result.total_energy = result.total_energy * 1000;
  }

  // Fix fractional waste values (waste should be whole numbers in MT)
  if (result.waste_reused !== undefined && result.waste_reused > 0 && result.waste_reused < 1) {
    result.waste_reused = 0;
  }
  if (result.waste_recycled !== undefined && result.waste_recycled > 0 && result.waste_recycled < 1) {
    result.waste_recycled = 0;
  }

  // Clean text fields
  const textFields = ['theory_q1', 'theory_q5', 'theory_q7', 'theory_q8', 'theory_q10', 'theory_q12', 'p3_ca_hand_injury'];
  for (const field of textFields) {
    if (typeof result[field] === 'string') {
      result[field] = result[field].replace(/\s+/g, ' ').trim();
    }
  }

  // ─── Clean up duplicate/old fields ─────────────────────────────────────────
  delete result.p3_iso_45001;
  delete result.p3_assess_health;
  delete result.p3_assess_working;

  // ─── Add confidence scoring ─────────────────────────────────────────────────
  result._confidence = {
    p3_assessment: result.p3_assessment_hs_percent > 0 ? "high" : "low",
    water_discharge: result.wd_third_notx > 0 ? "high" : "medium",
    ghg: (result.ghg_scope1 > 0 && result.ghg_scope2 > 0) ? "high" : "medium"
  };

  return result;
}

// ─── MAIN LLM EXTRACTION PROMPTS ─────────────────────────────────────────────

function buildNumericExtractionPrompt(fullText: string, yearInfo: DetectedYears): string {
  const extractYear = yearInfo.col2Year; // Previous year (older = second column)
  
  return `You are an expert BRSR (Business Responsibility and Sustainability Report) data extraction system.

## CRITICAL RULE - AUTO-DETECTED YEAR
Tables contain TWO years of data:
- First column = ${yearInfo.col1Year} (Current Year)
- Second column = ${yearInfo.col2Year} (Previous Year)

ALWAYS extract ${extractYear} values (Previous Year / Older column).

## EXACT FIELD MAPPING (use these exact field names):

### Energy (in GJ)
- energy_A: Electricity consumption from renewable sources (${extractYear})
- energy_B: Fuel consumption from renewable sources (${extractYear})
- energy_C: Other renewable sources (${extractYear})
- energy_D: Electricity consumption from non-renewable sources (${extractYear})
- energy_E: Fuel consumption from non-renewable sources (${extractYear})
- energy_F: Other non-renewable sources (${extractYear})
- total_energy: Total energy consumed (A+B+C+D+E+F) (${extractYear})
- intensity: Energy intensity per rupee of turnover (${extractYear})
- prodIntensity: Energy intensity in terms of physical output (${extractYear})

### Water (in kL)
- water_surface: Surface water (${extractYear})
- water_ground: Groundwater (${extractYear})
- water_thirdparty: Third party / purchased water (${extractYear})
- water_seawater: Seawater or desalinated water (${extractYear})
- water_others: Others (${extractYear})
- water_consumption: Total water consumption (${extractYear})

### Water Discharge (in kL)
- wd_surface_tx: Surface with treatment (${extractYear})
- wd_ground_notx: Groundwater without treatment (${extractYear})
- wd_third_notx: Third party without treatment (${extractYear})
- wd_others_tx: Others with treatment (${extractYear})

### Air Emissions (in Metric Tons)
- air_nox: NOx emissions (${extractYear})
- air_sox: SOx emissions (${extractYear})
- air_pm: Particulate matter emissions (${extractYear})

### GHG Emissions (in tCO2Eq)
- ghg_scope1: Total Scope 1 emissions (${extractYear})
- ghg_scope2: Total Scope 2 emissions (${extractYear})

### Waste Generated (in MT)
- waste_A: Plastic waste (${extractYear})
- waste_B: E-waste (${extractYear})
- waste_C: Bio-medical waste (${extractYear})
- waste_D: Construction and demolition waste (${extractYear})
- waste_E: Battery waste (${extractYear})
- waste_F: Radioactive waste (${extractYear})
- waste_G: Other Hazardous waste (${extractYear})
- waste_H: Other Non-hazardous waste (${extractYear})

### Waste Recovery & Disposal (in MT)
- waste_recycled: Recycled (${extractYear})
- waste_reused: Re-used (${extractYear})
- waste_recovery_other: Other recovery operations (${extractYear})
- waste_incineration: Incineration (${extractYear})
- waste_landfill: Landfilling (${extractYear})

### Safety & People Metrics
- p3_iso_45001: % of sites certified ISO 45001 (e.g., "70%" → 70) (${extractYear})
- p3_assess_health: % of employees assessed for health and safety practices (${extractYear})
- p3_assess_working: % of workers assessed for working conditions (${extractYear})
- p3_fatalities_employees: Number of employee fatalities (${extractYear})
- p3_fatalities_workers: Number of worker fatalities (${extractYear})
- p3_ltifr: Lost Time Injury Frequency Rate (${extractYear})

## IMPORTANT RULES
1. ALWAYS extract ${extractYear} values (Previous Year / Second column / Older column)
2. For percentages, return just the number (e.g., "70%" → 70)
3. Remove all commas from numbers
4. If a value is not found, set it to 0 (zero is valid data)
5. Return ONLY a valid JSON object with these exact field names

PDF TEXT:
${fullText}`;
}

function buildTheoryExtractionPrompt(safetySection: string, envSection: string): string {
  return `Extract narrative answers from BRSR text. Return JSON with these fields:
- theory_q1: Energy intensity notes and context
- theory_q5: Zero Liquid Discharge (ZLD) details
- theory_q7: GHG intensity notes
- theory_q8: Emission reduction projects/initiatives
- theory_q10: Waste management practices
- theory_q12: Grievance redressal mechanism description
- p3_ca_hand_injury: Corrective actions for hand injury risk / safety incidents

Use empty string "" if information is not found.

SAFETY SECTION:
${safetySection}

ENVIRONMENT SECTION:
${envSection}`;
}

// ─── API HANDLER ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!API_KEY) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    console.log("[parse-pdf] Extracting PDF text...");
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await extractPdf(buffer);
    const text = pdfData.fullText;

    if (!text || text.trim().length < 100) {
      return NextResponse.json({ 
        error: "PDF appears to contain no extractable text (scanned/image-based PDF). This system requires text-based PDFs.",
      }, { status: 422 });
    }

    console.log(`[parse-pdf] Extracted ${text.length} chars from ${pdfData.pages?.length || 0} pages`);

    // ─── STEP 0: AUTO-DETECT YEARS FROM PDF ────────────────────────────────
    const yearInfo = detectYearsFromPdf(text);
    console.log(`[parse-pdf] Detected: Col1=${yearInfo.col1Year}, Col2=${yearInfo.col2Year}, ExtractCol=${yearInfo.extractCol}`);

    // ─── STEP 1: LLM Extract ALL Numeric Data ────────────────────────────────
    console.log("[parse-pdf] Sending to LLM for numeric data extraction...");
    const numericData = await callLLMWithFallback(
      buildNumericExtractionPrompt(text, yearInfo), 
      "NUMERIC_EXTRACTION"
    );
    console.log("[parse-pdf] LLM Numeric Result:", JSON.stringify(numericData, null, 2));

    // ─── STEP 2: LLM Extract Theory/Narrative ───────────────────────────────
    console.log("[parse-pdf] Extracting narrative sections...");
    const safetySection = extractSection(text, ["well-being", "Principle 3", "corrective action"], 10, 400);
    const envSection = extractSection(text, ["protect and restore", "Principle 6", "environment"], 10, 400);
    const theoryData = await callLLMWithFallback(buildTheoryExtractionPrompt(safetySection, envSection), "THEORY_EXTRACTION");
    console.log("[parse-pdf] LLM Theory Result:", JSON.stringify(theoryData, null, 2));

    // ─── STEP 3: SAFE MERGE (No overwriting with defaults) ───────────────────
    let merged = safeMerge(DEFAULT_PY_DATA as Record<string, any>, numericData);
    merged = safeMerge(merged, theoryData);
    
    // ─── STEP 4: POST-PROCESS (Fix scales, sanity checks, regex fallback) ─────────────────
    const processed = postProcess(merged, text, yearInfo);

    // ─── STEP 5: Type conversion ────────────────────────────────────────────
    const finalData: PyData = Object.fromEntries(
      Object.entries(processed).map(([k, v]) => {
        if (typeof v === 'string' && /^\d+\.?\d*$/.test(v)) {
          return [k, parseFloat(v)];
        }
        return [k, v];
      })
    ) as unknown as PyData;

    console.log("====================================================");
    console.log("FINAL EXTRACTED BRSR JSON OUTPUT:");
    console.log(JSON.stringify(finalData, null, 2));
    console.log("====================================================");

    const outputPath = path.join(process.cwd(), "extracted_brsr.json");
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    console.log(`[parse-pdf] Output saved to: ${outputPath}`);

    return NextResponse.json({ success: true, data: finalData });
  } catch (err) {
    console.error("[parse-pdf] Fatal error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
