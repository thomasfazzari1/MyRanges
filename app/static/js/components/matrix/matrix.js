import {
   getCellBackground
} from "./utils.js";

class Matrix {
   constructor(containerId, columns, rows, legendContainerId, directoryService) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.columns = columns || ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
      this.rows = rows || ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
      this.colHeaderContainer = document.getElementById("colHeaders");
      this.legendContainer = document.getElementById(legendContainerId);

      this.directoryService = directoryService;
      this.legendInstance = null;

      this.currentLegend = null;
      this.currentMatrix = null;
      this.currentPath = null;
      this.currentName = null;

      this.rangeTitleElement = document.getElementById("rangeTitle");
   }

   setLegendInstance(legendInstance) {
      this.legendInstance = legendInstance;
   }

   render(matrix, legend, path, name) {
      if (!matrix) return;

      this.currentLegend = legend;
      this.currentMatrix = matrix;
      this.currentPath = path;
      this.currentName = name;

      if (this.rangeTitleElement) {
         this.rangeTitleElement.textContent = name || "Untitled Range";
      }

      const newContainer = document.createElement("div");
      newContainer.style.opacity = "0";
      newContainer.style.transform = "translateX(-10px)";
      newContainer.style.transition = "opacity 0.4s ease, transform 0.4s ease";

      if (this.colHeaderContainer) {
         this.colHeaderContainer.innerHTML = '<div class="w-10 h-8"></div>';
         this.renderColumnHeaders();
      }

      this.renderRows(matrix, newContainer);
      this.replaceContainerContent(newContainer);

      if (legend && this.legendInstance) {
         this.legendInstance.render(legend, matrix, path, name);
      }
   }

   renderColumnHeaders() {
      this.columns.forEach((colName) => {
         const colDiv = document.createElement("div");
         colDiv.className = "w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-300";
         colDiv.textContent = colName;
         this.colHeaderContainer.appendChild(colDiv);
      });
   }

   renderRows(matrix, container) {
      matrix.forEach((row, rowIndex) => {
         const rowDiv = document.createElement("div");
         rowDiv.className = "flex items-center mb-0.5";

         const rowHeaderDiv = document.createElement("div");
         rowHeaderDiv.className = "cell-header";
         rowHeaderDiv.textContent = this.rows[rowIndex] || "";
         rowDiv.appendChild(rowHeaderDiv);

         row.forEach((cell) => {
            const cellDiv = document.createElement("div");
            cellDiv.className = "cell-content";
            cellDiv.style.background = getCellBackground(cell.colors);
            cellDiv.textContent = cell.display_name;
            rowDiv.appendChild(cellDiv);
         });

         container.appendChild(rowDiv);
      });
   }

   replaceContainerContent(newContent) {
      if (this.container.children.length > 0) {
         const oldContent = this.container.children[0];
         oldContent.style.opacity = "0";
         oldContent.style.transform = "translateX(10px)";
      }

      setTimeout(() => {
         this.container.innerHTML = "";
         this.container.appendChild(newContent);

         requestAnimationFrame(() => {
            newContent.style.opacity = "1";
            newContent.style.transform = "translateX(0)";
         });
      }, 50);
   }
}

export default Matrix;