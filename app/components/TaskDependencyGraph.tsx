"use client";

import React, { useEffect, useRef } from 'react';
import { Task } from '../types/task';
import * as d3 from 'd3';

interface TaskDependencyGraphProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  className?: string;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  status: Task['status'];
  priority: Task['priority'];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const TaskDependencyGraph: React.FC<TaskDependencyGraphProps> = ({
  tasks,
  onTaskClick,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data
    const nodes: GraphNode[] = tasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
    }));

    const links: GraphLink[] = tasks.reduce((acc: GraphLink[], task) => {
      if (task.dependsOn) {
        task.dependsOn.forEach(dependencyId => {
          acc.push({
            source: dependencyId,
            target: task.id,
          });
        });
      }
      return acc;
    }, []);

    // Set up SVG
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current);

    // Create arrow marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#4B5563');

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create container for zoom/pan
    const container = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        container.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Create links
    const link = container.append('g')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    // Create nodes
    const node = container.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer');

    // Add drag behavior
    const drag = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on('drag', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on('end', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });

    node.call(drag);

    // Add click handler
    node.on('click', (event: MouseEvent, d: GraphNode) => {
      const task = tasks.find(t => t.id === d.id);
      if (task && onTaskClick) {
        onTaskClick(task);
      }
    });

    // Add circles to nodes
    node.append('circle')
      .attr('r', 25)
      .attr('fill', d => getStatusColor(d.status))
      .attr('stroke', d => getPriorityColor(d.priority))
      .attr('stroke-width', 3);

    // Add text to nodes
    node.append('text')
      .text(d => d.title.slice(0, 15) + (d.title.length > 15 ? '...' : ''))
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('fill', 'white')
      .attr('font-size', '12px');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x ?? 0)
        .attr('y1', d => (d.source as GraphNode).y ?? 0)
        .attr('x2', d => (d.target as GraphNode).x ?? 0)
        .attr('y2', d => (d.target as GraphNode).y ?? 0);

      node
        .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [tasks, onTaskClick]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return '#1F2937';
      case 'in-progress':
        return '#374151';
      case 'done':
        return '#065F46';
      default:
        return '#1F2937';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '#DC2626';
      case 'medium':
        return '#D97706';
      case 'low':
        return '#059669';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Task Dependencies</h2>
      <div className="relative w-full" style={{ height: '400px' }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ background: '#1F2937', borderRadius: '0.5rem' }}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#1F2937]" />
          <span className="text-sm">To Do</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#374151]" />
          <span className="text-sm">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#065F46]" />
          <span className="text-sm">Done</span>
        </div>
        <div className="border-l border-gray-600 mx-2" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-[#DC2626]" />
          <span className="text-sm">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-[#D97706]" />
          <span className="text-sm">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-[#059669]" />
          <span className="text-sm">Low Priority</span>
        </div>
      </div>
    </div>
  );
};

export default TaskDependencyGraph;
