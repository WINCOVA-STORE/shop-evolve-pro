import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface RoadmapItem {
  phase_number: number;
  phase_name: string;
  sprint_number: string;
  sprint_name: string;
  item_number: string;
  feature_name: string;
  description: string | null;
  status: string;
  priority: string;
  effort: string;
  started_at: string | null;
  completed_at: string | null;
  metadata: any;
}

interface RoadmapMetrics {
  total_items: number;
  completed_items: number;
  in_progress_items: number;
  blocked_items: number;
  progress_percentage: number;
}

export const useRoadmapPDFExport = () => {
  const generatePDF = async (items: RoadmapItem[], metrics: RoadmapMetrics) => {
    // Generar insights con IA
    const { data: insightsData } = await supabase.functions.invoke('generate-roadmap-insights', {
      body: { items, metrics }
    });

    const aiAnalysis = insightsData?.analysis || "Análisis no disponible";
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    
    // Colores del branding Wincova (tuplas específicas)
    const WINCOVA_ORANGE: [number, number, number] = [243, 156, 18]; // #F39C12
    const WINCOVA_BLUE: [number, number, number] = [15, 23, 42]; // #0F172A
    const LIGHT_GRAY: [number, number, number] = [249, 250, 251];
    const SUCCESS_GREEN: [number, number, number] = [16, 185, 129];
    const WARNING_YELLOW: [number, number, number] = [251, 191, 36];
    const DANGER_RED: [number, number, number] = [239, 68, 68];

    // === PORTADA EJECUTIVA CON BRANDING ===
    // Gradiente naranja de Wincova
    const [r1, g1, b1] = WINCOVA_ORANGE;
    doc.setFillColor(r1, g1, b1);
    doc.rect(0, 0, pageWidth, 90, "F");
    
    // Acento azul oscuro
    const [r2, g2, b2] = WINCOVA_BLUE;
    doc.setFillColor(r2, g2, b2);
    doc.rect(0, 90, pageWidth, 15, "F");
    
    // Logo/Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(38);
    doc.setFont("helvetica", "bold");
    doc.text("WINCOVA STORE", pageWidth / 2, 35, { align: "center" });
    
    doc.setFontSize(22);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte Ejecutivo del Roadmap", pageWidth / 2, 55, { align: "center" });
    
    // Badge de progreso
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${metrics.progress_percentage.toFixed(0)}% Completado`, pageWidth / 2, 75, { align: "center" });
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}`,
      pageWidth / 2,
      97,
      { align: "center" }
    );

    // Reset color de texto
    doc.setTextColor(0, 0, 0);
    yPosition = 120;

    // === RESUMEN EJECUTIVO ===
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WINCOVA_ORANGE);
    doc.text("📊 Panel de Control Ejecutivo", 20, yPosition);
    yPosition += 12;

    // Métricas clave en cards
    const cardWidth = (pageWidth - 50) / 4;
    const cardHeight = 30;
    const cardStartY = yPosition;
    const cardSpacing = 5;

    const metricsData = [
      {
        label: "Total Tareas",
        value: metrics.total_items.toString(),
        color: WINCOVA_BLUE,
      },
      {
        label: "Completadas",
        value: metrics.completed_items.toString(),
        color: SUCCESS_GREEN,
      },
      {
        label: "En Progreso",
        value: metrics.in_progress_items.toString(),
        color: WARNING_YELLOW,
      },
      {
        label: "Bloqueadas",
        value: metrics.blocked_items.toString(),
        color: DANGER_RED,
      },
    ];

    metricsData.forEach((metric, index) => {
      const xPos = 20 + index * (cardWidth + cardSpacing);
      
      // Card background con gradiente simulado
      doc.setFillColor(...LIGHT_GRAY);
      doc.roundedRect(xPos, cardStartY, cardWidth, cardHeight, 5, 5, "F");
      
      // Border
      const [r, g, b] = metric.color;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.5);
      doc.roundedRect(xPos, cardStartY, cardWidth, cardHeight, 3, 3, "S");
      
      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(metric.label, xPos + cardWidth / 2, cardStartY + 10, { align: "center" });
      
      // Value
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b);
      doc.text(metric.value, xPos + cardWidth / 2, cardStartY + 22, { align: "center" });
    });

    yPosition = cardStartY + cardHeight + 15;

    // Barra de progreso
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Progreso General: ${metrics.progress_percentage.toFixed(1)}%`,
      20,
      yPosition
    );
    
    yPosition += 5;
    const progressBarWidth = pageWidth - 40;
    const progressBarHeight = 10;
    
    // Background bar
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(20, yPosition, progressBarWidth, progressBarHeight, 3, 3, "F");
    
    // Progress bar con color Wincova
    const progressWidth = (progressBarWidth * metrics.progress_percentage) / 100;
    doc.setFillColor(...WINCOVA_ORANGE);
    doc.roundedRect(20, yPosition, progressWidth, progressBarHeight, 5, 5, "F");

    yPosition += 25;
    
    // === ANÁLISIS INTELIGENTE CON IA ===
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WINCOVA_ORANGE);
    doc.text("🤖 Análisis Inteligente", 20, yPosition);
    yPosition += 10;
    
    // Renderizar análisis de IA
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const analysisLines = doc.splitTextToSize(aiAnalysis, pageWidth - 40);
    
    // Asegurar que cabe en la página
    if (yPosition + analysisLines.length * 5 > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(analysisLines, 20, yPosition);
    yPosition += analysisLines.length * 5 + 10;

    // === DESGLOSE POR FASES ===
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WINCOVA_ORANGE);
    doc.text("🎯 Desglose Detallado por Fases", 20, yPosition);
    yPosition += 12;

    // Agrupar items por fase y sprint
    const itemsByPhase = items.reduce((acc, item) => {
      const phaseKey = `${item.phase_number}-${item.phase_name}`;
      if (!acc[phaseKey]) {
        acc[phaseKey] = {};
      }
      
      const sprintKey = `${item.sprint_number}-${item.sprint_name}`;
      if (!acc[phaseKey][sprintKey]) {
        acc[phaseKey][sprintKey] = [];
      }
      
      acc[phaseKey][sprintKey].push(item);
      return acc;
    }, {} as Record<string, Record<string, RoadmapItem[]>>);

    // Renderizar cada fase
    Object.entries(itemsByPhase).forEach(([phaseKey, sprints]) => {
      const [phaseNum, phaseName] = phaseKey.split("-");
      
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Fase header con branding
      doc.setFillColor(...WINCOVA_BLUE);
      doc.roundedRect(20, yPosition, pageWidth - 40, 14, 3, 3, "F");
      
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`FASE ${phaseNum}: ${phaseName}`, 25, yPosition + 9);
      
      // Calcular progreso de fase
      const phaseItems = Object.values(sprints).flat();
      const phaseCompleted = phaseItems.filter(i => i.status === 'done').length;
      const phaseProgress = ((phaseCompleted / phaseItems.length) * 100).toFixed(0);
      
      doc.setTextColor(...WINCOVA_ORANGE);
      doc.text(`${phaseProgress}%`, pageWidth - 30, yPosition + 9);
      
      yPosition += 17;

      // Sprints dentro de la fase
      Object.entries(sprints).forEach(([sprintKey, sprintItems]) => {
        const [sprintNum, sprintName] = sprintKey.split("-");
        
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        // Sprint header
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Sprint ${sprintNum}: ${sprintName}`, 25, yPosition);
        yPosition += 7;

        // Tabla de items del sprint
        const tableData = sprintItems.map((item) => [
          item.item_number,
          item.feature_name,
          item.status === "done" ? "✅" : item.status === "in_progress" ? "🔄" : item.status === "blocked" ? "🚫" : "⏸️",
          item.priority === "high" ? "🔴" : item.priority === "medium" ? "🟡" : "🟢",
          item.effort,
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["#", "Tarea", "Estado", "Prioridad", "Esfuerzo"]],
          body: tableData,
          theme: "grid",
          headStyles: {
            fillColor: WINCOVA_ORANGE,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
          },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 80 },
            2: { cellWidth: 20, halign: "center" },
            3: { cellWidth: 25, halign: "center" },
            4: { cellWidth: 25, halign: "center" },
          },
          margin: { left: 25, right: 20 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      });

      yPosition += 5;
    });

    // === PÁGINA FINAL: MÉTRICAS AVANZADAS ===
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WINCOVA_ORANGE);
    doc.text("📈 Métricas y Proyecciones", 20, yPosition);
    yPosition += 15;

    // Velocity calculation
    const completedItems = items.filter((i) => i.status === "done");
    const avgCompletionDays = completedItems.length > 0
      ? completedItems.reduce((acc, item) => {
          if (item.started_at && item.completed_at) {
            const start = new Date(item.started_at);
            const end = new Date(item.completed_at);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return acc + days;
          }
          return acc;
        }, 0) / completedItems.length
      : 0;

    const insights = [
      {
        icon: "📈",
        title: "Velocidad del Equipo",
        text: `Se completan aproximadamente ${avgCompletionDays.toFixed(1)} días por tarea en promedio.`,
      },
      {
        icon: "⚠️",
        title: "Riesgos Identificados",
        text: `${metrics.blocked_items} tareas están bloqueadas y requieren atención inmediata.`,
      },
      {
        icon: "🎯",
        title: "Próximos Hitos",
        text: `${metrics.in_progress_items} tareas en progreso que completarán la siguiente fase.`,
      },
      {
        icon: "✨",
        title: "Proyección de Finalización",
        text: `A este ritmo, el proyecto se completará en aproximadamente ${Math.ceil((metrics.total_items - metrics.completed_items) * avgCompletionDays / 7)} semanas.`,
      },
    ];

    insights.forEach((insight) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Insight card con borde naranja
      doc.setFillColor(...LIGHT_GRAY);
      doc.roundedRect(20, yPosition, pageWidth - 40, 28, 5, 5, "F");
      
      // Borde lateral naranja
      doc.setFillColor(...WINCOVA_ORANGE);
      doc.roundedRect(20, yPosition, 3, 28, 5, 5, "F");
      
      // Icon
      doc.setFontSize(18);
      doc.text(insight.icon, 28, yPosition + 12);
      
      // Title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WINCOVA_BLUE);
      doc.text(insight.title, 45, yPosition + 11);
      
      // Text
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const splitText = doc.splitTextToSize(insight.text, pageWidth - 65);
      doc.text(splitText, 45, yPosition + 19);
      
      yPosition += 33;
    });

    // Footer profesional en todas las páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Línea naranja en el footer
      doc.setDrawColor(...WINCOVA_ORANGE);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
      
      // Texto del footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Wincova Store - Reporte Ejecutivo Generado con IA",
        20,
        pageHeight - 10
      );
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: "right" }
      );
    }

    // Descargar PDF
    doc.save(`Wincova-Roadmap-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return { generatePDF };
};
