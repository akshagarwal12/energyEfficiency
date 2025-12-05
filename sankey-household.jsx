import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const householdData = {
  refrigerator: {
    title: "Refrigerator Energy Flow",
    subtitle: "Annual kWh distribution",
    unit: "kWh/year",
    nodes: [
      { name: "Electricity Input" },
      { name: "Compressor" },
      { name: "Lighting" },
      { name: "Electronics" },
      { name: "Defrost Heater" },
      { name: "Cooling" },
      { name: "Heat Rejection" },
      { name: "Fan Operation" },
      { name: "Standby Loss" }
    ],
    links: [
      { source: 0, target: 1, value: 320 },
      { source: 0, target: 2, value: 25 },
      { source: 0, target: 3, value: 35 },
      { source: 0, target: 4, value: 40 },
      { source: 1, target: 5, value: 180 },
      { source: 1, target: 6, value: 100 },
      { source: 1, target: 7, value: 40 },
      { source: 3, target: 8, value: 35 }
    ]
  },
  washingMachine: {
    title: "Washing Machine Water Cycle",
    subtitle: "Per load water usage (liters)",
    unit: "liters",
    nodes: [
      { name: "Water Intake" },
      { name: "Pre-wash" },
      { name: "Main Wash" },
      { name: "Rinse Cycle 1" },
      { name: "Rinse Cycle 2" },
      { name: "Spin Drain" },
      { name: "Greywater Out" },
      { name: "Evaporation" },
      { name: "Residual Moisture" }
    ],
    links: [
      { source: 0, target: 1, value: 15 },
      { source: 0, target: 2, value: 25 },
      { source: 0, target: 3, value: 20 },
      { source: 0, target: 4, value: 20 },
      { source: 1, target: 6, value: 15 },
      { source: 2, target: 6, value: 25 },
      { source: 3, target: 6, value: 20 },
      { source: 4, target: 5, value: 20 },
      { source: 5, target: 6, value: 17 },
      { source: 5, target: 7, value: 1 },
      { source: 5, target: 8, value: 2 }
    ]
  },
  hvacSystem: {
    title: "HVAC Energy Distribution",
    subtitle: "Winter heating breakdown (BTU/hr)",
    unit: "BTU/hr",
    nodes: [
      { name: "Natural Gas" },
      { name: "Electricity" },
      { name: "Furnace" },
      { name: "Blower Motor" },
      { name: "Thermostat" },
      { name: "Heat to Rooms" },
      { name: "Duct Loss" },
      { name: "Flue Exhaust" },
      { name: "Standby" }
    ],
    links: [
      { source: 0, target: 2, value: 80000 },
      { source: 1, target: 3, value: 2000 },
      { source: 1, target: 4, value: 50 },
      { source: 2, target: 5, value: 64000 },
      { source: 2, target: 6, value: 8000 },
      { source: 2, target: 7, value: 8000 },
      { source: 3, target: 5, value: 1800 },
      { source: 3, target: 6, value: 200 },
      { source: 4, target: 8, value: 50 }
    ]
  },
  dishwasher: {
    title: "Dishwasher Resource Flow",
    subtitle: "Per cycle consumption",
    unit: "units",
    nodes: [
      { name: "Water (gal)" },
      { name: "Electricity (Wh)" },
      { name: "Detergent (ml)" },
      { name: "Pre-rinse" },
      { name: "Wash Cycle" },
      { name: "Heated Dry" },
      { name: "Clean Dishes" },
      { name: "Drain Output" },
      { name: "Heat Loss" }
    ],
    links: [
      { source: 0, target: 3, value: 1.5 },
      { source: 0, target: 4, value: 4 },
      { source: 1, target: 4, value: 1200 },
      { source: 1, target: 5, value: 600 },
      { source: 2, target: 4, value: 25 },
      { source: 3, target: 7, value: 1.5 },
      { source: 4, target: 6, value: 800 },
      { source: 4, target: 7, value: 4 },
      { source: 5, target: 6, value: 400 },
      { source: 5, target: 8, value: 200 }
    ]
  },
  coffeeMaker: {
    title: "Coffee Maker Energy Path",
    subtitle: "Brewing cycle (Wh)",
    unit: "Wh",
    nodes: [
      { name: "Electrical Input" },
      { name: "Heating Element" },
      { name: "Pump Motor" },
      { name: "Control Board" },
      { name: "Water Heating" },
      { name: "Heat to Carafe" },
      { name: "Steam Loss" },
      { name: "Warming Plate" },
      { name: "Idle Draw" }
    ],
    links: [
      { source: 0, target: 1, value: 900 },
      { source: 0, target: 2, value: 60 },
      { source: 0, target: 3, value: 15 },
      { source: 1, target: 4, value: 720 },
      { source: 1, target: 6, value: 80 },
      { source: 1, target: 7, value: 100 },
      { source: 4, target: 5, value: 720 },
      { source: 2, target: 5, value: 60 },
      { source: 3, target: 8, value: 15 }
    ]
  },
  vacuum: {
    title: "Vacuum Cleaner Power Flow",
    subtitle: "Operating power (W)",
    unit: "W",
    nodes: [
      { name: "AC Power" },
      { name: "Motor" },
      { name: "Control Circuit" },
      { name: "Suction Fan" },
      { name: "Brush Roll" },
      { name: "Debris Collection" },
      { name: "Air Exhaust" },
      { name: "Heat Generation" },
      { name: "Noise Energy" }
    ],
    links: [
      { source: 0, target: 1, value: 1200 },
      { source: 0, target: 2, value: 20 },
      { source: 1, target: 3, value: 800 },
      { source: 1, target: 4, value: 150 },
      { source: 1, target: 7, value: 200 },
      { source: 1, target: 8, value: 50 },
      { source: 3, target: 5, value: 400 },
      { source: 3, target: 6, value: 400 },
      { source: 4, target: 5, value: 150 },
      { source: 2, target: 7, value: 20 }
    ]
  }
};

const SankeyDiagram = ({ data, colorScheme }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [dimensions, setDimensions] = useState({ width: 700, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        const width = Math.min(container.clientWidth - 40, 800);
        setDimensions({ width, height: Math.max(350, width * 0.5) });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 120, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const sankeyGenerator = sankey()
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[0, 0], [width, height]]);

    const graph = sankeyGenerator({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    });

    const defs = svg.append("defs");
    
    graph.links.forEach((link, i) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", link.source.x1)
        .attr("x2", link.target.x0);

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScheme.primary)
        .attr("stop-opacity", 0.8);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScheme.secondary)
        .attr("stop-opacity", 0.6);
    });

    // Links
    g.append("g")
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (d, i) => `url(#gradient-${i})`)
      .attr("stroke-width", d => Math.max(2, d.width))
      .attr("opacity", 0.7)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        d3.select(this).attr("opacity", 1);
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
          show: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: `${d.source.name} → ${d.target.name}: ${d.value.toLocaleString()} ${data.unit}`
        });
      })
      .on("mouseleave", function() {
        d3.select(this).attr("opacity", 0.7);
        setTooltip({ ...tooltip, show: false });
      });

    // Nodes
    const nodes = g.append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => Math.max(4, d.y1 - d.y0))
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", colorScheme.node)
      .attr("stroke", colorScheme.primary)
      .attr("stroke-width", 2)
      .attr("rx", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        d3.select(this).attr("fill", colorScheme.primary);
        const rect = svgRef.current.getBoundingClientRect();
        const totalIn = d.targetLinks.reduce((sum, l) => sum + l.value, 0);
        const totalOut = d.sourceLinks.reduce((sum, l) => sum + l.value, 0);
        setTooltip({
          show: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: `${d.name}\nIn: ${totalIn.toLocaleString()} | Out: ${totalOut.toLocaleString()}`
        });
      })
      .on("mouseleave", function() {
        d3.select(this).attr("fill", colorScheme.node);
        setTooltip({ ...tooltip, show: false });
      });

    // Labels
    g.append("g")
      .selectAll("text")
      .data(graph.nodes)
      .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 8 : d.x0 - 8)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .attr("fill", colorScheme.text)
      .attr("font-size", "11px")
      .attr("font-family", "'JetBrains Mono', monospace")
      .text(d => d.name);

  }, [data, colorScheme, dimensions]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />
      {tooltip.show && (
        <div style={{
          position: 'absolute',
          left: tooltip.x,
          top: tooltip.y,
          transform: 'translate(-50%, -100%)',
          background: 'rgba(10, 25, 35, 0.95)',
          border: `1px solid ${colorScheme.primary}`,
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: "'JetBrains Mono', monospace",
          color: colorScheme.text,
          whiteSpace: 'pre-line',
          pointerEvents: 'none',
          zIndex: 100,
          boxShadow: `0 0 20px ${colorScheme.primary}40`
        }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

const GridBackground = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    background: `
      linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px),
      linear-gradient(135deg, #0a1419 0%, #0d1f2d 50%, #0a1419 100%)
    `,
    backgroundSize: '40px 40px, 40px 40px, 100% 100%'
  }} />
);

const icons = {
  refrigerator: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="10" y1="6" x2="10" y2="6.01" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="14" x2="10" y2="14.01" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  washingMachine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
      <rect x="3" y="2" width="18" height="20" rx="2" />
      <circle cx="12" cy="13" r="5" />
      <circle cx="12" cy="13" r="2" />
      <line x1="7" y1="5" x2="7" y2="5.01" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="5" x2="10" y2="5.01" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  hvacSystem: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
      <circle cx="12" cy="12" r="4" />
      <path d="M18.4 5.6l-2.1 2.1m-8.6 8.6l-2.1 2.1m0-12.8l2.1 2.1m8.6 8.6l2.1 2.1" />
    </svg>
  ),
  dishwasher: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
      <rect x="3" y="2" width="18" height="20" rx="2" />
      <line x1="3" y1="7" x2="21" y2="7" />
      <circle cx="12" cy="14" r="4" />
      <path d="M12 12v4M10 14h4" />
    </svg>
  ),
  coffeeMaker: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
      <path d="M17 8h1a4 4 0 010 8h-1" />
      <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  vacuum: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
      <ellipse cx="12" cy="18" rx="8" ry="4" />
      <path d="M12 14V6" />
      <circle cx="12" cy="4" r="2" />
      <path d="M4 18l-2 2m18-2l2 2" />
    </svg>
  )
};

export default function HouseholdSankeyShowcase() {
  const [activeItem, setActiveItem] = useState('refrigerator');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const colorSchemes = {
    refrigerator: { primary: '#00d4aa', secondary: '#0088ff', node: '#0a2530', text: '#a8d4d0' },
    washingMachine: { primary: '#00a8ff', secondary: '#00d4ff', node: '#0a2035', text: '#a8d0e8' },
    hvacSystem: { primary: '#ff6b35', secondary: '#ffaa00', node: '#2a1a10', text: '#e8c8a8' },
    dishwasher: { primary: '#8b5cf6', secondary: '#d946ef', node: '#1a1530', text: '#d0c0e8' },
    coffeeMaker: { primary: '#f59e0b', secondary: '#ef4444', node: '#2a2010', text: '#e8d8a8' },
    vacuum: { primary: '#10b981', secondary: '#06b6d4', node: '#102520', text: '#a8e8d0' }
  };

  const currentScheme = colorSchemes[activeItem];

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#e8f0f0',
      overflow: 'hidden'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      
      <GridBackground />
      
      {/* Header */}
      <header style={{
        padding: '32px 24px',
        borderBottom: '1px solid rgba(0, 212, 170, 0.2)',
        background: 'rgba(10, 20, 25, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            marginBottom: 8
          }}>
            <div style={{
              width: 40,
              height: 40,
              border: '2px solid #00d4aa',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 212, 170, 0.1)'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2" style={{ width: 24, height: 24 }}>
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                <path d="M10 6h4M6 10v4M18 10v4M10 18h4" strokeOpacity="0.5" />
              </svg>
            </div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(20px, 4vw, 28px)',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              <span style={{ color: '#00d4aa' }}>SANKEY</span>
              <span style={{ color: '#4a6670', margin: '0 8px' }}>/</span>
              <span>HOUSEHOLD</span>
            </h1>
          </div>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: '#5a8080',
            margin: 0,
            letterSpacing: '0.05em'
          }}>
            ENERGY & RESOURCE FLOW VISUALIZATION // v2.0.1
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        padding: '16px 24px',
        background: 'rgba(10, 20, 25, 0.6)',
        borderBottom: '1px solid rgba(0, 212, 170, 0.1)',
        overflowX: 'auto',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap'
        }}>
          {Object.entries(householdData).map(([key, item], index) => (
            <button
              key={key}
              onClick={() => setActiveItem(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: activeItem === key 
                  ? `linear-gradient(135deg, ${colorSchemes[key].primary}20, ${colorSchemes[key].secondary}10)`
                  : 'transparent',
                border: `1px solid ${activeItem === key ? colorSchemes[key].primary : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                color: activeItem === key ? colorSchemes[key].primary : '#6a8a90',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(10px)',
                transitionDelay: `${0.15 + index * 0.05}s`
              }}
              onMouseEnter={e => {
                if (activeItem !== key) {
                  e.currentTarget.style.borderColor = colorSchemes[key].primary + '60';
                  e.currentTarget.style.color = colorSchemes[key].primary;
                }
              }}
              onMouseLeave={e => {
                if (activeItem !== key) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#6a8a90';
                }
              }}
            >
              <span style={{ opacity: 0.8 }}>{icons[key]}</span>
              {item.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '40px 24px'
      }}>
        {/* Diagram Card */}
        <div style={{
          background: 'rgba(10, 20, 30, 0.7)',
          border: '1px solid rgba(0, 212, 170, 0.15)',
          borderRadius: 16,
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s'
        }}>
          {/* Card Header */}
          <div style={{
            padding: '24px 32px',
            borderBottom: `1px solid ${currentScheme.primary}30`,
            background: `linear-gradient(90deg, ${currentScheme.primary}08, transparent)`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ color: currentScheme.primary }}>{icons[activeItem]}</span>
                <h2 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(18px, 3vw, 24px)',
                  fontWeight: 600,
                  margin: 0,
                  color: '#fff'
                }}>
                  {householdData[activeItem].title}
                </h2>
              </div>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: currentScheme.text,
                margin: 0,
                opacity: 0.8
              }}>
                {householdData[activeItem].subtitle}
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: `${currentScheme.primary}15`,
              borderRadius: 20,
              border: `1px solid ${currentScheme.primary}30`
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: currentScheme.primary,
                animation: 'pulse 2s infinite'
              }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: currentScheme.primary,
                textTransform: 'uppercase'
              }}>
                Interactive
              </span>
            </div>
          </div>

          {/* Diagram Area */}
          <div style={{
            padding: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            background: `radial-gradient(ellipse at center, ${currentScheme.primary}05, transparent 70%)`
          }}>
            <SankeyDiagram 
              data={householdData[activeItem]} 
              colorScheme={currentScheme}
            />
          </div>

          {/* Card Footer */}
          <div style={{
            padding: '20px 32px',
            borderTop: `1px solid ${currentScheme.primary}20`,
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#5a7a80'
            }}>
              <span style={{ color: currentScheme.primary }}>◈</span> Hover over nodes and links for details
            </div>
            <div style={{
              display: 'flex',
              gap: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11
            }}>
              <span style={{ color: '#5a7a80' }}>
                NODES: <span style={{ color: currentScheme.text }}>{householdData[activeItem].nodes.length}</span>
              </span>
              <span style={{ color: '#5a7a80' }}>
                LINKS: <span style={{ color: currentScheme.text }}>{householdData[activeItem].links.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginTop: 32
        }}>
          {[
            { 
              title: 'About Sankey Diagrams', 
              content: 'Flow diagrams where link width is proportional to flow quantity. Invented by Irish captain Matthew Sankey in 1898 to visualize energy efficiency of steam engines.',
              delay: '0.4s'
            },
            { 
              title: 'Reading the Flows', 
              content: 'Follow the streams from input sources on the left to outputs on the right. Wider paths indicate larger quantities. Branches show how resources split between destinations.',
              delay: '0.5s'
            },
            { 
              title: 'Efficiency Insights', 
              content: 'Identify inefficiencies by tracking where energy or resources are lost. Thicker waste streams highlight opportunities for optimization and cost savings.',
              delay: '0.6s'
            }
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: 24,
                background: 'rgba(10, 20, 30, 0.5)',
                border: '1px solid rgba(0, 212, 170, 0.1)',
                borderRadius: 12,
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${item.delay}`
              }}
            >
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: '#00d4aa',
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  background: 'rgba(0, 212, 170, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10
                }}>
                  {i + 1}
                </span>
                {item.title}
              </h3>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                lineHeight: 1.7,
                color: '#8aa0a4',
                margin: 0
              }}>
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        borderTop: '1px solid rgba(0, 212, 170, 0.1)',
        marginTop: 40,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.8s ease 0.7s'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: '#4a6670'
          }}>
            SANKEY//HOUSEHOLD — Visualizing everyday energy flows
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: '#3a5660',
            display: 'flex',
            gap: 24
          }}>
            <span>D3.JS</span>
            <span>REACT</span>
            <span>SVG</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a1419; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(0, 212, 170, 0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 170, 0.5); }
      `}</style>
    </div>
  );
}
