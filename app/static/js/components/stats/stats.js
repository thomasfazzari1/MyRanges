export default class Stats {
   constructor(containerId, directoryService) {
      this.container = document.getElementById(containerId);
      this.directoryService = directoryService;
      this.charts = {};
      this.chartOptions = {
         responsive: true,
         maintainAspectRatio: false,
         plugins: {
            legend: {
               position: 'top',
               labels: {
                  color: '#E5E7EB',
                  font: {
                     family: 'Inter'
                  }
               }
            }
         }
      };
   }

   static TOTAL_HANDS = 169;

   async render(path, rangeName) {
      try {
         if (!path || !rangeName) throw new Error("Path ou nom de la range manquant.");
         const rangeData = await this.directoryService.fetchRange(path, rangeName);
         if (!rangeData.matrix) throw new Error("Données de la range invalides.");

         this.processMatrix(rangeData.matrix);
      } catch (error) {
         console.error("Erreur dans le rendu :", error);
         this.showError();
      }
   }

   processMatrix(matrix) {
      const stats = this.calculateStats(matrix);
      this.updateUI(stats);
      this.createCharts(stats);
   }

   getGap(name) {
      const ranks = 'AKQJT98765432';
      if (name[0] === name[1]) return null;
      const r1 = ranks.indexOf(name[0]);
      const r2 = ranks.indexOf(name[1]);
      return Math.abs(r1 - r2) - 1;
   }

   isBroadway(name) {
      const broadway = 'AKQJT';
      return broadway.includes(name[0]) && broadway.includes(name[1]);
   }

   calculateStats(matrix) {
      let playedHands = 0;
      let pairs = 0;
      let suited = 0;
      let offsuit = 0;
      let connectors = 0;
      let oneGap = 0;
      let twoGap = 0;
      let broadway = 0;
      let ace = 0;
      let king = 0;
      let queen = 0;
      let jack = 0;
      let ten = 0;

      matrix.forEach(row => {
         row.forEach(cell => {
            if (!cell || !cell.display_name) return;

            const isPlayed = cell.colors && cell.colors.length > 0;
            if (!isPlayed) return;

            playedHands++;
            const name = cell.display_name;

            if (name[0] === name[1]) pairs++;
            else if (name.includes('s')) suited++;
            else offsuit++;

            const gap = this.getGap(name);
            if (gap === 0) connectors++;
            if (gap === 1) oneGap++;
            if (gap === 2) twoGap++;

            if (this.isBroadway(name)) broadway++;
            if (name[0] === 'A') ace++;
            if (name[0] === 'K') king++;
            if (name[0] === 'Q') queen++;
            if (name[0] === 'J') jack++;
            if (name[0] === 'T') ten++;
         });
      });

      return {
         total: Stats.TOTAL_HANDS,
         played: playedHands,
         playedPercentage: ((playedHands / Stats.TOTAL_HANDS) * 100).toFixed(1),
         pairs: ((pairs / playedHands) * 100).toFixed(1),
         suited: ((suited / playedHands) * 100).toFixed(1),
         offsuit: ((offsuit / playedHands) * 100).toFixed(1),
         connectors: ((connectors / playedHands) * 100).toFixed(1),
         oneGap: ((oneGap / playedHands) * 100).toFixed(1),
         twoGap: ((twoGap / playedHands) * 100).toFixed(1),
         broadway: ((broadway / playedHands) * 100).toFixed(1),
         ace: ((ace / playedHands) * 100).toFixed(1),
         king: ((king / playedHands) * 100).toFixed(1),
         queen: ((queen / playedHands) * 100).toFixed(1),
         jack: ((jack / playedHands) * 100).toFixed(1),
         ten: ((ten / playedHands) * 100).toFixed(1)
      };
   }

   createCharts(stats) {
      this.createPieChart(stats);
      this.createConnectivityChart(stats);
      this.createHighCardsChart(stats);
   }

   createPieChart(stats) {
      const ctx = document.getElementById('handTypeChart').getContext('2d');
      if (this.charts.handType) this.charts.handType.destroy();

      this.charts.handType = new Chart(ctx, {
         type: 'doughnut',
         data: {
            labels: ['Paires', 'Suited', 'Offsuit'],
            datasets: [{
               data: [stats.pairs, stats.suited, stats.offsuit],
               backgroundColor: ['#ff9999', '#66b3ff', '#99ff99'],
               borderColor: '#1F2937',
               borderWidth: 1
            }]
         },
         options: {
            ...this.chartOptions,
            cutout: '60%'
         }
      });
   }

   createConnectivityChart(stats) {
      const ctx = document.getElementById('connectivityChart').getContext('2d');
      if (this.charts.connectivity) this.charts.connectivity.destroy();

      this.charts.connectivity = new Chart(ctx, {
         type: 'bar',
         data: {
            labels: ['Connecteurs', '1-Gap', '2-Gap'],
            datasets: [{
               label: 'Pourcentage',
               data: [stats.connectors, stats.oneGap, stats.twoGap],
               backgroundColor: ['#ffcc99', '#ff9999', '#c2c2f0'],
               borderColor: '#2563EB',
               borderWidth: 1
            }]
         },
         options: {
            ...this.chartOptions,
            scales: {
               y: {
                  beginAtZero: true,
                  grid: {
                     color: '#374151'
                  },
                  ticks: {
                     color: '#E5E7EB'
                  }
               },
               x: {
                  grid: {
                     color: '#374151'
                  },
                  ticks: {
                     color: '#E5E7EB'
                  }
               }
            }
         }
      });
   }

   createHighCardsChart(stats) {
      const ctx = document.getElementById('highCardsChart').getContext('2d');
      if (this.charts.highCards) this.charts.highCards.destroy();

      this.charts.highCards = new Chart(ctx, {
         type: 'bar',
         data: {
            labels: ['Broadway', 'As', 'Roi', 'Dame', 'Valet', '10'],
            datasets: [{
               label: 'Pourcentage',
               data: [stats.broadway, stats.ace, stats.king, stats.queen, stats.jack, stats.ten],
               backgroundColor: ['#c2c2f0', '#ffcc99', '#ffb3e6', '#99ff99', '#66b3ff', '#ff9999'],
               borderColor: '#2563EB',
               borderWidth: 1
            }]
         },
         options: {
            ...this.chartOptions,
            scales: {
               y: {
                  beginAtZero: true,
                  grid: {
                     color: '#374151'
                  },
                  ticks: {
                     color: '#E5E7EB'
                  }
               },
               x: {
                  grid: {
                     color: '#374151'
                  },
                  ticks: {
                     color: '#E5E7EB'
                  }
               }
            }
         }
      });
   }

   updateUI(stats) {
      document.getElementById('playedHands').textContent = `${stats.played}/169`;
      document.getElementById('playedPercentage').textContent = `${stats.playedPercentage}%`;
      document.getElementById('playedHandsBar').style.width = `${(stats.played / 169) * 100}%`;
      document.getElementById('playedPercentageBar').style.width = `${stats.playedPercentage}%`;
   }

   showError() {
      this.container.innerHTML = `
            <div class="text-red-400 p-4">
                <i class="fas fa-exclamation-circle mr-2"></i>
                Erreur lors du chargement des statistiques.
            </div>
        `;
   }
}