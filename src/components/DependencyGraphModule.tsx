import React, { useState } from "react";
import { DependencyNode, DependencyEdge } from "../types";
import { Network, HelpCircle, Layers, FolderCheck } from "lucide-react";

interface DependencyGraphModuleProps {
  graph: {
    nodes: DependencyNode[];
    edges: DependencyEdge[];
  };
}

export default function DependencyGraphModule({ graph }: DependencyGraphModuleProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);

  const { nodes, edges } = graph;

  // Lay out nodes visually in a grid/circle pattern for our custom SVG canvas
  const padding = 60;
  const width = 800;
  const height = 400;

  // Calculate coordinates: We can place them in structured semantic layers or columns
  // Column 1: Client/Routes, Column 2: Controller, Column 3: Service/Utility, Column 4: Database/Model
  const getNodeTypeColumn = (type: string) => {
    switch (type) {
      case "route":
      case "client":
        return 0;
      case "controller":
        return 1;
      case "service":
      case "module":
        return 2;
      default:
        return 3;
    }
  };

  const getColX = (col: number) => {
    return padding + (col * (width - padding * 2)) / 3;
  };

  // Group nodes by col to calculate their Y steps
  const colsCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const nodeWithCoords = nodes.map((n) => {
    const col = getNodeTypeColumn(n.type);
    const index = colsCount[col]++;
    return { ...n, col, index };
  });

  const nodeCoordsMap: Record<string, { x: number; y: number }> = {};
  const coordNodes = nodeWithCoords.map((n) => {
    const totalInCol = colsCount[n.col];
    const x = getColX(n.col);
    // Evenly distribute y values inside the height
    const yRatio = totalInCol > 1 ? n.index / (totalInCol - 1) : 0.5;
    const y = padding + yRatio * (height - padding * 2);
    nodeCoordsMap[n.id] = { x, y };
    return { ...n, x, y };
  });

  const getNodeColor = (type: string, isSelected: boolean) => {
    if (isSelected) return "fill-blue-600 stroke-blue-200";
    switch (type) {
      case "route":
        return "fill-red-500 stroke-red-100";
      case "controller":
        return "fill-amber-500 stroke-amber-100";
      case "service":
      case "module":
        return "fill-indigo-500 stroke-indigo-100";
      case "database":
        return "fill-emerald-500 stroke-emerald-100";
      default:
        return "fill-slate-500 stroke-slate-100";
    }
  };

  const isEdgeHighlighted = (edge: DependencyEdge) => {
    if (!selectedNodeId && !hoverNodeId) return true;
    const targetId = selectedNodeId || hoverNodeId;
    return edge.source === targetId || edge.target === targetId;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Interactive Dependency Explorer</h2>
            <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
              Semantic module dependencies view. Maps imports between controllers, libraries, controllers, databases and outer assets automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
        {/* Legendary Panel Explorer Details */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" /> Layer Legend
            </h3>
            <div className="space-y-3.5 mt-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Router / Ingress Gateway</span>
                  <span className="text-2xs text-slate-400 leading-none">Handles incoming server entries</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Controllers / Dispatchers</span>
                  <span className="text-2xs text-slate-400 leading-none">Handles validation and responses</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Core Services / Utilities</span>
                  <span className="text-2xs text-slate-400 leading-none">Business transaction handlers</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Database Models / Pools</span>
                  <span className="text-2xs text-slate-400 leading-none">Manages active persistent schemas</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-bold block mb-1">Interaction Guide:</span>
              Hover or click on any node inside the graph to isolate import relationships and dependency coupling.
            </div>
          </div>

          <div className="text-2xs text-slate-400 pt-3 border-t border-slate-50 mt-4 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Double click resets state filter view
          </div>
        </div>

        {/* Dynamic SVG Interactive Connector Map Canvas */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-center overflow-x-auto min-h-[440px]">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-4 px-2">
            <span className="flex items-center gap-1"><FolderCheck className="w-3.5 h-3.5 text-emerald-500" /> Scope: Connected Core Files Mapping</span>
            {selectedNodeId && (
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Clear Node Isolation
              </button>
            )}
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[700px]">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-300" />
              </marker>
              <marker id="arrow-highlight" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-blue-500" />
              </marker>
            </defs>

            {/* Drawing relationship Edges */}
            {edges.map((edge) => {
              const from = nodeCoordsMap[edge.source];
              const to = nodeCoordsMap[edge.target];
              if (!from || !to) return null;

              const highlighted = isEdgeHighlighted(edge);
              return (
                <g key={edge.id} className="transition-all duration-300">
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={highlighted ? (selectedNodeId || hoverNodeId ? "#3b82f6" : "#cbd5e1") : "#f1f5f9"}
                    strokeWidth={highlighted ? 2.5 : 1}
                    className="transition-all duration-300"
                    markerEnd={`url(#${highlighted && (selectedNodeId || hoverNodeId) ? "arrow-highlight" : "arrow"})`}
                  />
                  {edge.label && highlighted && (
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 - 4}
                      className="fill-slate-400 text-3xs font-mono text-center"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Drawing Nodes */}
            {coordNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoverNodeId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoverNodeId(node.id)}
                  onMouseLeave={() => setHoverNodeId(null)}
                  onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                >
                  <circle
                    r="15"
                    className={`${getNodeColor(node.type, isSelected || isHovered)} stroke-2 transition-all duration-300`}
                  />
                  <text
                    y="32"
                    textAnchor="middle"
                    className={`text-2xs font-bold font-sans transition-all duration-300 ${
                      isSelected || isHovered ? "fill-blue-700 font-extrabold" : "fill-slate-600"
                    }`}
                  >
                    {node.label.replace(/^src\//i, "")}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
