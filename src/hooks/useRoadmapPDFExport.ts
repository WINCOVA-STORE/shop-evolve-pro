import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

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
  const generatePDF = (items: RoadmapItem[], metrics: RoadmapMetrics) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // === PORTADA EJECUTIVA ===
    // Gradiente simulado con rectángulos
    doc.setFillColor(102, 126, 234); // Primary color
    doc.rect(0, 0, pageWidth, 80, "F");
    
    // Logo/Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("WINCOVA STORE", pageWidth / 2, 40, { align: "center" });
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("Roadmap Ejecutivo del Proyecto", pageWidth / 2, 55, { align: "center" });
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.text(
      `Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}`,
      pageWidth / 2,
      70,
      { align: "center" }
    );

    // Reset color de texto
    doc.setTextColor(0, 0, 0);
    yPosition = 100;

    // === RESUMEN EJECUTIVO ===
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("📊 Resumen Ejecutivo", 20, yPosition);
    yPosition += 10;

    // Métricas clave en cards
    const cardWidth = (pageWidth - 50) / 4;
    const cardHeight = 30;
    const cardStartY = yPosition;
    const cardSpacing = 5;

    const metricsData = [
      {
        label: "Total Tareas",
        value: metrics.total_items.toString(),
        color: [102, 126, 234], // Primary
      },
      {
        label: "Completadas",
        value: metrics.completed_items.toString(),
        color: [16, 185, 129], // Green
      },
      {
        label: "En Progreso",
        value: metrics.in_progress_items.toString(),
        color: [251, 191, 36], // Yellow
      },
      {
        label: "Bloqueadas",
        value: metrics.blocked_items.toString(),
        color: [239, 68, 68], // Red
      },
    ];

    metricsData.forEach((metric, index) => {
      const xPos = 20 + index * (cardWidth + cardSpacing);
      
      // Card background
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(xPos, cardStartY, cardWidth, cardHeight, 3, 3, "F");
      
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
    
    // Progress bar
    const progressWidth = (progressBarWidth * metrics.progress_percentage) / 100;
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(20, yPosition, progressWidth, progressBarHeight, 3, 3, "F");

    yPosition += 20;

    // === DESGLOSE POR FASES ===
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("🎯 Desglose por Fases y Sprints", 20, yPosition);
    yPosition += 10;

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

      // Fase header
      doc.setFillColor(102, 126, 234);
      doc.rect(20, yPosition, pageWidth - 40, 12, "F");
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`FASE ${phaseNum}: ${phaseName}`, 25, yPosition + 8);
      
      yPosition += 15;

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
            fillColor: [249, 250, 251],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            fontSize: 8,
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

    // === PÁGINA FINAL: INSIGHTS Y RECOMENDACIONES ===
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("💡 Insights y Recomendaciones", 20, yPosition);
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

      // Insight card
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, "F");
      
      // Icon
      doc.setFontSize(16);
      doc.text(insight.icon, 25, yPosition + 10);
      
      // Title
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(insight.title, 40, yPosition + 10);
      
      // Text
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);
      const splitText = doc.splitTextToSize(insight.text, pageWidth - 60);
      doc.text(splitText, 40, yPosition + 17);
      
      yPosition += 30;
    });

    // Footer en todas las páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Wincova Store - Roadmap Ejecutivo | Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Descargar PDF
    doc.save(`Wincova-Roadmap-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return { generatePDF };
};
