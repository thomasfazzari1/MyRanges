import DirectoryService from './services/directoryService.js';
import EquityService from './services/equityService.js';
import Explorer from './components/explorer/explorer.js';
import { debounce } from './components/matrix/utils.js';
import Matrix from './components/matrix/matrix.js';
import Legend from './components/matrix/legend.js';
import Equity from './components/equity/equity.js';
import Stats from './components/stats/stats.js';

class App {
   constructor() {
      this.initializeServices();
      this.initializeComponents();
      this.initializeEventListeners();
   }

   initializeServices() {
      this.directoryService = new DirectoryService();
      this.equityService = new EquityService();
      this.currentPath = [];
      this.currentName = null;
   }

   initializeComponents() {
      this.matrix = new Matrix("rangeMatrix", null, null, "legendContainer", this.directoryService);
      this.legend = new Legend("legendContainer", this.directoryService, this.matrix);
      this.explorer = new Explorer(this.directoryService, this.onRangeSelected.bind(this));
      this.equity = new Equity(this.equityService);
      this.stats = new Stats("contentStats", this.directoryService);

      this.matrix.setLegendInstance(this.legend);
   }


   initializeEventListeners() {
      const tabMatrix = document.getElementById('tabMatrix');
      const tabEquity = document.getElementById('tabEquity');
      const tabStats = document.getElementById('tabStats');
      const tabTraining = document.getElementById('tabTraining');

      const contentMatrix = document.getElementById('contentMatrix');
      const contentEquity = document.getElementById('contentEquity');
      const contentStats = document.getElementById('contentStats');
      const contentTraining = document.getElementById('contentTraining');

      const activateTab = (activeTab, activeContent, otherTabs, otherContents) => {
         activeTab.classList.add('active', 'tab-button');
         activeContent.style.display = 'block';
         setTimeout(() => {
            activeContent.classList.add('active');
         }, 50);

         otherTabs.forEach(tab => tab.classList.remove('active', 'tab-button'));
         otherContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
         });
      };

      tabMatrix.addEventListener('click', () =>
         activateTab(tabMatrix, contentMatrix, [tabEquity, tabStats, tabTraining], [contentEquity, contentStats, contentTraining])
      );

      tabEquity.addEventListener('click', () =>
         activateTab(tabEquity, contentEquity, [tabMatrix, tabStats, tabTraining], [contentMatrix, contentStats, contentTraining])
      );

      tabStats.addEventListener('click', () =>
         activateTab(tabStats, contentStats, [tabMatrix, tabEquity, tabTraining], [contentMatrix, contentEquity, contentTraining])
      );

      tabTraining.addEventListener('click', () =>
         activateTab(tabTraining, contentTraining, [tabMatrix, tabEquity, tabStats], [contentMatrix, contentEquity, contentStats])
      );

      activateTab(tabMatrix, contentMatrix, [tabEquity, tabStats, tabTraining], [contentEquity, contentStats, contentTraining]);

      const saveNewLegendItem = document.getElementById('saveNewLegendItem');
      if (saveNewLegendItem) {
         saveNewLegendItem.addEventListener('click', async () => {
            const colorInput = document.getElementById('newLegendColor');
            const descInput = document.getElementById('newLegendDescription');
            const modal = document.getElementById('createLegendModal');

            if (!colorInput || !descInput) {
               console.error("Les champs du modal sont manquants.");
               return;
            }

            const color = colorInput.value;
            const description = descInput.value.trim();

            if (!description) {
               alert('Veuillez saisir une description.');
               return;
            }

            if (!this.currentPath || !this.currentName) {
               console.error("Path ou Name manquants.");
               return;
            }

            await this.directoryService.addLegendItem(this.currentPath, this.currentName, color, description);
            const updatedRangeData = await this.directoryService.fetchRange(this.currentPath, this.currentName);
            this.matrix.render(updatedRangeData.matrix, updatedRangeData.legend, this.currentPath, this.currentName);
            modal.classList.add('hidden');
         });
      }
   }

   async onRangeSelected(rangeName, rangeData, path) {
      if (!rangeData) {
         console.error('Données manquantes pour la range.');
         return;
      }

      this.currentPath = path;
      this.currentName = rangeName;

      document.getElementById('mainContent').classList.remove('hidden');
      document.getElementById('welcomeScreen').classList.add('hidden');

      this.matrix.render(rangeData.matrix, rangeData.legend, path, rangeName);
      await this.stats.render(path, rangeName);
   }
}

document.addEventListener('DOMContentLoaded', () => {
   new App();

   document.getElementById('mainContent').classList.add('hidden');
   document.getElementById('welcomeScreen').classList.remove('hidden');
});