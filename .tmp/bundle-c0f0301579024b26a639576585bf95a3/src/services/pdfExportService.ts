import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserProfile, CompletedWorkoutRecord, GPSActivity } from "../types";

export interface PDFExportOptions {
  profile: UserProfile;
  history: CompletedWorkoutRecord[];
  gpsActivities: GPSActivity[];
  streakDays?: number;
}

export const pdfExportService = {
  /**
   * Generates and downloads a comprehensive athlete performance report PDF
   */
  generateAthleteReportPDF(options: PDFExportOptions): void {
    const { profile, history, gpsActivities, streakDays = 7 } = options;

    // Create document in portrait, millimeters, A4
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const primaryDark = [15, 23, 42]; // slate-900
    const emeraldAccent = [16, 185, 129]; // emerald-500
    const lightBg = [248, 250, 252]; // slate-50
    const darkText = [30, 41, 59]; // slate-800
    const mutedText = [100, 116, 139]; // slate-500

    // ==========================================
    // 1. TOP HEADER BANNER
    // ==========================================
    doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.rect(0, 0, pageWidth, 42, "F");

    // Emerald accent strip
    doc.setFillColor(emeraldAccent[0], emeraldAccent[1], emeraldAccent[2]);
    doc.rect(0, 40, pageWidth, 2.5, "F");

    // Brand Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("FORZON", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 185, 129);
    doc.text("PERFORMANCE INTELLIGENCE & TRACKING LAB", 14, 25);

    // Document Title on the right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("RELATÓRIO DO ATLETA", pageWidth - 14, 18, { align: "right" });

    const exportDateStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Emitido em: ${exportDateStr}`, pageWidth - 14, 25, { align: "right" });

    // ==========================================
    // 2. ATHLETE PROFILE SUMMARY BOX
    // ==========================================
    let currentY = 50;

    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 26, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, pageWidth - 28, 26, 3, 3, "S");

    // Athlete Name & Goal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(profile.name, 20, currentY + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text(`${profile.handle}  |  Nível: ${profile.experienceLevel}  |  Meta: ${profile.mainGoal}`, 20, currentY + 16);

    // Height, Weight, Streak on the right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    const athleteMetrics = `${profile.weightKg} kg  -  ${profile.heightCm} cm  -  Streak: ${streakDays} Dias`;
    doc.text(athleteMetrics, pageWidth - 20, currentY + 10, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129);
    doc.text(`Rotina: ${profile.trainingDaysPerWeek}x/semana (${profile.timePerSessionMin} min)`, pageWidth - 20, currentY + 17, { align: "right" });

    currentY += 34;

    // ==========================================
    // 3. STATISTICAL KPI TILES
    // ==========================================
    const totalVolumeKg = history.reduce((sum, h) => sum + (h.totalVolumeKg || 0), 0);
    const totalOutdoorKm = gpsActivities.reduce((sum, g) => sum + (g.distanceKm || 0), 0);
    const totalOutdoorSec = gpsActivities.reduce((sum, g) => sum + (g.durationSeconds || 0), 0);
    const totalOutdoorHours = (totalOutdoorSec / 3600).toFixed(1);
    const totalCaloriesBurned = gpsActivities.reduce((sum, g) => sum + (g.caloriesBurnedEstimated || 0), 0);

    const kpiTileWidth = (pageWidth - 28 - 9) / 4;
    const kpiTileHeight = 20;

    const kpis = [
      { label: "TREINOS CONCLUÍDOS", value: `${history.length}`, sub: "Sessões de Força" },
      { label: "VOLUME LEVANTADO", value: `${(totalVolumeKg / 1000).toFixed(1)}k kg`, sub: `${totalVolumeKg.toLocaleString("pt-BR")} kg total` },
      { label: "DISTÂNCIA GPS", value: `${totalOutdoorKm.toFixed(1)} km`, sub: `${totalOutdoorHours}h em movimento` },
      { label: "CALORIAS ATIVAS", value: `${totalCaloriesBurned} kcal`, sub: "Atividades GPS" },
    ];

    kpis.forEach((kpi, idx) => {
      const tileX = 14 + idx * (kpiTileWidth + 3);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(tileX, currentY, kpiTileWidth, kpiTileHeight, 2, 2, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      doc.text(kpi.label, tileX + 4, currentY + 5.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(kpi.value, tileX + 4, currentY + 12.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(16, 185, 129);
      doc.text(kpi.sub, tileX + 4, currentY + 17);
    });

    currentY += kpiTileHeight + 10;

    // ==========================================
    // 4. HISTÓRICO DE TREINOS DE FORÇA (TABLE)
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text("1. Histórico de Treinos Concluídos (Musculação / Força)", 14, currentY);

    currentY += 4;

    const workoutTableRows = history.map((w) => {
      const dateFormatted = new Date(w.completedAt || w.startedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const durationMin = Math.round((w.durationSeconds || 0) / 60);
      const prText = w.prsAchieved && w.prsAchieved.length > 0 ? w.prsAchieved.join("; ") : "-";

      return [
        dateFormatted,
        w.title,
        `${durationMin} min`,
        `${(w.totalVolumeKg || 0).toLocaleString("pt-BR")} kg`,
        `${w.totalSets || 0} séries / ${w.totalReps || 0} reps`,
        w.perceivedEffortRpe ? `${w.perceivedEffortRpe}/10` : "-",
        prText,
      ];
    });

    if (workoutTableRows.length === 0) {
      workoutTableRows.push(["-", "Nenhum treino registrado ainda", "-", "-", "-", "-", "-"]);
    }

    autoTable(doc, {
      startY: currentY,
      head: [["Data/Hora", "Treino", "Duração", "Volume Total", "Séries / Reps", "RPE", "Recordes / PRs"]],
      body: workoutTableRows,
      theme: "striped",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: "bold",
        halign: "left",
      },
      styles: {
        fontSize: 7,
        cellPadding: 2.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 44, fontStyle: "bold" },
        2: { cellWidth: 16 },
        3: { cellWidth: 22, fontStyle: "bold", textColor: [16, 185, 129] },
        4: { cellWidth: 26 },
        5: { cellWidth: 14 },
        6: { cellWidth: "auto" },
      },
      margin: { left: 14, right: 14 },
    });

    // Get table bottom Y
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastAutoTableDoc = doc as any;
    currentY = (lastAutoTableDoc.lastAutoTable?.finalY || currentY + 30) + 12;

    // Check if we need a new page for GPS activities
    if (currentY + 50 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    // ==========================================
    // 5. ATIVIDADES GPS AO AR LIVRE (TABLE)
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text("2. Métricas de Atividades GPS ao Ar Livre", 14, currentY);

    currentY += 4;

    const translateType = (type: string) => {
      switch (type) {
        case "running":
          return "Corrida";
        case "cycling":
          return "Ciclismo";
        case "walking":
          return "Caminhada";
        case "hiking":
          return "Trilha";
        default:
          return type;
      }
    };

    const gpsTableRows = gpsActivities.map((g) => {
      const dateFormatted = new Date(g.startedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const durationMin = Math.round((g.durationSeconds || 0) / 60);

      return [
        dateFormatted,
        translateType(g.type),
        g.title,
        `${g.distanceKm.toFixed(2)} km`,
        `${durationMin} min`,
        g.averagePaceMinPerKm ? `${g.averagePaceMinPerKm} /km` : `${g.averageSpeedKmh.toFixed(1)} km/h`,
        `${g.elevationGainM || 0} m`,
        `${g.caloriesBurnedEstimated || 0} kcal`,
      ];
    });

    if (gpsTableRows.length === 0) {
      gpsTableRows.push(["-", "-", "Nenhuma atividade GPS gravada ainda", "-", "-", "-", "-", "-"]);
    }

    autoTable(doc, {
      startY: currentY,
      head: [["Data/Hora", "Modalidade", "Título / Rota", "Distância", "Duração", "Ritmo Médio", "Ganho Alt.", "Calorias"]],
      body: gpsTableRows,
      theme: "striped",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: "bold",
        halign: "left",
      },
      styles: {
        fontSize: 7,
        cellPadding: 2.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 22, fontStyle: "bold" },
        2: { cellWidth: 46 },
        3: { cellWidth: 20, fontStyle: "bold", textColor: [16, 185, 129] },
        4: { cellWidth: 16 },
        5: { cellWidth: 20 },
        6: { cellWidth: 16 },
        7: { cellWidth: "auto" },
      },
      margin: { left: 14, right: 14 },
    });

    // ==========================================
    // 6. FOOTER ON ALL PAGES
    // ==========================================
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Footer divider line
      doc.setDrawColor(226, 232, 240);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      doc.text("FORZON Athletic Intelligence - Relatório pessoal exportado pelo usuário sob conformidade LGPD.", 14, pageHeight - 7);

      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: "right" });
    }

    // Trigger instant browser download without popups
    const sanitizedName = (profile.name || "atleta").toLowerCase().replace(/[^a-z0-9]/gi, "_");
    const filename = `FORZON_Relatorio_${sanitizedName}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  },
};
