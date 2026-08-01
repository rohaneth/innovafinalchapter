import { runReviewGraph } from "../graph";

async function runTest() {
  console.log("====================================================");
  console.log("  Developer 3: AI Review Engine Execution Test");
  console.log("====================================================\n");

  console.log("1. Initializing Multi-Agent State Graph...");
  const startTime = Date.now();

  const finalState = await runReviewGraph("emp-001", "2026-H1");

  const duration = Date.now() - startTime;

  console.log(`\nGraph execution completed in ${duration}ms with status: ${finalState.status}`);
  console.log("\n----------------------------------------------------");
  console.log("SUMMARY OF GRAPH STATE OUTPUT:");
  console.log("----------------------------------------------------");

  console.log(`- Raw Inputs Collected: ${finalState.rawInputs.length}`);
  console.log(`- Evidence Chunks Processed: ${finalState.evidenceChunks.length}`);

  if (finalState.draftReview) {
    console.log("\n[SYNTHESIZED REVIEW REPORT DRAFT]");
    console.log(`  Employee ID : ${finalState.draftReview.employeeId}`);
    console.log(`  Period      : ${finalState.draftReview.period}`);
    console.log(`  Strengths   : ${finalState.draftReview.strengths.length} items`);
    finalState.draftReview.strengths.forEach((s, idx) => {
      console.log(`    ${idx + 1}. ${s.summary} (Citations: ${s.citations.join(", ")})`);
    });

    console.log(`  Growth Areas: ${finalState.draftReview.growthAreas.length} items`);
    finalState.draftReview.growthAreas.forEach((g, idx) => {
      console.log(`    ${idx + 1}. ${g.summary} (Citations: ${g.citations.join(", ")})`);
    });

    console.log(`  Goal Progress: ${finalState.draftReview.goalProgress.length} items`);
    finalState.draftReview.goalProgress.forEach((gp, idx) => {
      console.log(`    - ${gp.goal} [Status: ${gp.status}]: ${gp.summary}`);
    });
  }

  console.log(`\n[AUDITOR BIAS & GAP FLAGS] (${finalState.auditFlags.length} flags generated)`);
  finalState.auditFlags.forEach((flag, idx) => {
    console.log(`  Flag #${idx + 1} [Type: ${flag.biasType} | Severity: ${flag.severity.toUpperCase()}]`);
    console.log(`    Target      : ${flag.targetSection}`);
    console.log(`    Description : ${flag.description}`);
    console.log(`    Suggested   : ${flag.suggestedRevision}`);
  });

  console.log("\n[EXECUTION METRICS]");
  console.log(JSON.stringify(finalState.metrics, null, 2));

  if (finalState.status === "completed" && finalState.draftReview && finalState.auditFlags.length > 0) {
    console.log("\n✅ VERIFICATION SUCCESS: All 4 Nodes (Collector -> Retriever -> Synthesizer -> Auditor) executed flawlessly.");
  } else {
    console.error("\n❌ VERIFICATION FAILED.");
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error("Fatal Test Execution Error:", err);
  process.exit(1);
});
