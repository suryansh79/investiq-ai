// ============================================================================
// InvestIQ AI — LangGraph Workflow
// Assembles the multi-agent research graph.
// Architecture:
//   [START] ➔ [Research] ➔ [Financial] ➔ [Risk] ➔ [Debate] ➔ [Decision] ➔ [END]
// ============================================================================

import { StateGraph, END } from '@langchain/langgraph';
import { ResearchStateAnnotation } from './state';
import {
  consolidatedResearchAgent,
  financialHealthAgent,
  riskAnalysisAgent,
  debateAgents,
  decisionAgent,
  committeeAgent,
} from '@/agents';

// Wrapper nodes that catch errors gracefully
async function researchNode(
  state: typeof ResearchStateAnnotation.State
): Promise<Partial<typeof ResearchStateAnnotation.State>> {
  try {
    return await consolidatedResearchAgent(state);
  } catch (error) {
    console.error('Consolidated Research agent error:', error);
    return { error: `Research agent failed: ${error}` };
  }
}

async function financialNode(
  state: typeof ResearchStateAnnotation.State
): Promise<Partial<typeof ResearchStateAnnotation.State>> {
  try {
    return await financialHealthAgent(state);
  } catch (error) {
    console.error('Financial calculations error:', error);
    return { error: `Financial agent failed: ${error}` };
  }
}

async function riskNode(
  state: typeof ResearchStateAnnotation.State
): Promise<Partial<typeof ResearchStateAnnotation.State>> {
  try {
    return await riskAnalysisAgent(state);
  } catch (error) {
    console.error('Risk calculations error:', error);
    return { error: `Risk agent failed: ${error}` };
  }
}

async function debateNode(
  state: typeof ResearchStateAnnotation.State
): Promise<Partial<typeof ResearchStateAnnotation.State>> {
  try {
    return await debateAgents(state);
  } catch (error) {
    console.error('Debate coordinator error:', error);
    return { error: `Debate agents failed: ${error}` };
  }
}

async function committeeNode(
  state: typeof ResearchStateAnnotation.State
): Promise<Partial<typeof ResearchStateAnnotation.State>> {
  try {
    return await committeeAgent(state);
  } catch (error) {
    console.error('Committee coordinator error:', error);
    return { error: `Committee agent failed: ${error}` };
  }
}

async function decisionNode(
  state: typeof ResearchStateAnnotation.State
): Promise<Partial<typeof ResearchStateAnnotation.State>> {
  try {
    return await decisionAgent(state);
  } catch (error) {
    console.error('Decision agent error:', error);
    return { error: `Decision agent failed: ${error}` };
  }
}

/**
 * Creates and compiles the InvestIQ research graph.
 */
export function createResearchGraph() {
  const graph = new StateGraph(ResearchStateAnnotation)
    .addNode('research', researchNode)
    .addNode('financial', financialNode)
    .addNode('risk', riskNode)
    .addNode('run_debate', debateNode)
    .addNode('run_committee', committeeNode)
    .addNode('run_decision', decisionNode)
    
    // Connect nodes in a clear, sequential chain
    .addEdge('__start__', 'research')
    .addEdge('research', 'financial')
    .addEdge('financial', 'risk')
    .addEdge('risk', 'run_debate')
    .addEdge('run_debate', 'run_committee')
    .addEdge('run_committee', 'run_decision')
    .addEdge('run_decision', END);

  return graph.compile();
}
