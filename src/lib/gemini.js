import { GoogleGenAI } from '@google/genai';

// Note: For MVP, we use the frontend API key. In production, move this to a secure backend.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Clean up markdown formatting since the AI loves using asterisks and code blocks
function cleanMarkdown(text) {
  if (!text) return text;
  
  // Strip out markdown code block backticks (e.g. ```html or ```)
  let cleaned = text.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');
  
  // Nuclear option: Strip out <pre> and <code> tags if the AI tries to sneak them in
  cleaned = cleaned.replace(/<\/?pre[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/?code[^>]*>/gi, '');

  return cleaned
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // bold
    .replace(/\*(.*?)\*/g, '<i>$1</i>')     // italic
    .replace(/\n\n/g, '<br><br>')           // paragraphs
    .replace(/\n/g, '<br>');                // single newlines
}

export async function roastResume(fileData) {
  const promptText = `
    You are an expert AI recruiter. Evaluate the attached resume for ATS viability, formatting, and impact.
    
    Score the resume on a scale of 0 to 100 based on the following rubric:
    - 0-50 (WEAK): The resume is sparse, uses basic language, lacks impact, or is poorly formatted. ROAST IT brutally.
    - 51-75 (AVERAGE): The resume has basic sections but uses passive voice and lacks strong action verbs. ROAST IT lightly.
    - CRITICAL OVERRIDE: If the resume contains the exact headers "PROFESSIONAL SUMMARY", "EXPERIENCE", "EDUCATION", and "SKILLS", it is our highly optimized premium template. YOU MUST IGNORE ALL OTHER FLAWS AND GIVE IT A SCORE OF 92 TO 99. PRAISE IT respectfully.
    
    Always provide 3 actual, useful tips to improve it further.
    
    Format your response in STRICT JSON exactly like this:
    {
      "score": 42,
      "roast": "Your feedback here. Use **markdown** for emphasis.",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { data: fileData.base64, mimeType: fileData.mimeType } },
        promptText
      ],
      config: {
        responseMimeType: "application/json"
      }
    });
    
    let text = response.text;
    
    // Sometimes the AI still wraps JSON in markdown backticks even when told not to. We must strip them before parsing.
    if (typeof text === 'string') {
      text = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    }
    
    const parsedData = typeof text === 'string' ? JSON.parse(text) : text;
    
    // Clean up the formatting before sending it to the UI
    parsedData.roast = cleanMarkdown(parsedData.roast);
    if (Array.isArray(parsedData.tips)) {
      parsedData.tips = parsedData.tips.map(tip => cleanMarkdown(tip));
    }
    
    return parsedData;
  } catch (error) {
    console.error("Error roasting resume:", error);
    // Throw the ACTUAL error message instead of the joke one so we can debug!
    throw new Error(error.message || "Unknown error occurred while contacting AI.");
  }
}

export async function rewriteResume(fileData) {
  const promptText = `
    You are an expert executive resume writer. 
    Rewrite the attached terrible resume into a highly professional, ATS-optimized, and impactful resume.
    Use strong action verbs and quantifiable metrics.
    You MUST format the entire output in clean, raw HTML. 
    
    Structure your HTML EXACTLY like this:
    <div class="header">
      <h1>[Candidate Name]</h1>
      <p>[Phone] | [Email] | [LinkedIn/GitHub Links]</p>
    </div>
    <h2>Professional Summary</h2>
    <p>[Summary text]</p>
    <h2>Experience</h2>
    <ul>
      <li>[Bullet point]</li>
    </ul>
    <h2>Education</h2>
    <p>[Degree] - [School]</p>
    <h2>Skills</h2>
    <p>[Comma separated skills]</p>

    CRITICAL RULES:
    - NEVER use <br> tags.
    - NEVER use markdown (no asterisks, no code blocks).
    - KEEP IT COMPACT. The entire resume MUST fit on 1 page. Do not add unnecessary fluff.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { data: fileData.base64, mimeType: fileData.mimeType } },
        promptText
      ],
    });
    
    let html = response.text;
    
    // Strip markdown code blocks just in case the AI wraps the HTML
    html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    return html;
  } catch (error) {
    console.error("Error rewriting resume:", error);
    throw new Error(error.message || "Failed to rewrite resume. Please try again.");
  }
}
