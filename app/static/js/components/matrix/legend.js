class Legend {
   constructor(containerId, directoryService, matrixInstance) {
      this.container = document.getElementById(containerId);
      this.directoryService = directoryService;
      this.matrixInstance = matrixInstance;
      this.currentMatrix = null;
   }

   async updateLegendItem(path, name, index, updatedData) {
      try {
         await this.directoryService.updateLegendItem(path, name, index, updatedData);
         const updatedRangeData = await this.directoryService.fetchRange(path, name);

         this.render(updatedRangeData.legend, updatedRangeData.matrix, path, name);
         this.matrixInstance.render(updatedRangeData.matrix, updatedRangeData.legend, path, name);
      } catch (error) {
         console.error("Failed to update legend item:", error);
      }
   }

   async deleteLegendItem(path, name, index) {
      try {
         await this.directoryService.deleteLegendItem(path, name, index);
         const updatedRangeData = await this.directoryService.fetchRange(path, name);

         this.render(updatedRangeData.legend, updatedRangeData.matrix, path, name);
         this.matrixInstance.render(updatedRangeData.matrix, updatedRangeData.legend, path, name);
      } catch (error) {
         console.error("Failed to delete legend item:", error);
      }
   }

   renderLegendItem(item, index, matrix, path, name) {
      this.currentMatrix = matrix;
      const totalCells = matrix.flat().length;

      const legendItemDiv = document.createElement("div");
      legendItemDiv.className = "legend-item mb-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-xl p-4 transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50 shadow-md";

      const headerDiv = document.createElement("div");
      headerDiv.className = "flex items-center justify-between group";

      const leftContent = document.createElement("div");
      leftContent.className = "flex items-center gap-3";

      const colorPickerWrapper = document.createElement("div");
      colorPickerWrapper.className = "relative group/color";

      const colorBox = document.createElement("div");
      colorBox.className = "w-7 h-7 rounded-lg shadow-lg ring-2 ring-white/10 group-hover/color:ring-white/30 group-hover/color:scale-105 group-hover/color:shadow-xl cursor-pointer transition-all duration-200";
      colorBox.style.background = item.color;

      const colorPicker = document.createElement("input");
      colorPicker.type = "color";
      colorPicker.value = item.color;
      colorPicker.className = "absolute inset-0 opacity-0 cursor-pointer rounded-lg";

      colorPicker.addEventListener("input", async (event) => {
         const newColor = event.target.value;
         colorBox.style.background = newColor;
         try {
            await this.updateLegendItem(path, name, index, {
               color: newColor
            });
         } catch (error) {
            colorBox.style.background = item.color;
         }
      });

      colorPickerWrapper.appendChild(colorBox);
      colorPickerWrapper.appendChild(colorPicker);
      leftContent.appendChild(colorPickerWrapper);

      const textContent = document.createElement("div");
      textContent.className = "flex flex-col";

      const descriptionLabel = document.createElement("span");
      descriptionLabel.className = "text-sm text-gray-200 font-medium tracking-wide";
      descriptionLabel.textContent = item.description;

      const percentage = document.createElement("span");
      percentage.className = "text-xs font-medium text-gray-400";
      const itemCount = matrix.flat().filter((cell) => cell.colors.includes(item.color)).length;
      percentage.textContent = `${((itemCount / totalCells) * 100).toFixed(1)}% des mains`;

      textContent.appendChild(descriptionLabel);
      textContent.appendChild(percentage);
      leftContent.appendChild(textContent);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200";

      const editButton = document.createElement("button");
      editButton.className = "p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-blue-400 transition-all duration-200";
      editButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>';
      editButton.addEventListener("click", () => this.openEditModal(item, index, path, name));

      const deleteButton = document.createElement("button");
      deleteButton.className = "p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-red-400 transition-all duration-200";
      deleteButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
      deleteButton.addEventListener("click", async () => {
         const associatedPairs = matrix.flat().filter((cell) => cell.colors.includes(item.color));
         if (associatedPairs.length === 0) {
            if (confirm("Voulez-vous vraiment supprimer cet item de légende ?")) {
               try {
                  await this.deleteLegendItem(path, name, index);
               } catch (error) {
                  console.error("Error deleting legend item:", error);
               }
            }
         } else {
            alert("Impossible de supprimer cet item, des cellules lui sont encore associées.");
         }
      });

      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);
      headerDiv.appendChild(leftContent);
      headerDiv.appendChild(actionsDiv);

      legendItemDiv.appendChild(headerDiv);
      this.container.appendChild(legendItemDiv);
   }

   renderAddLegendButton(path, name) {
      const addButton = document.createElement("button");
      addButton.className = "group relative flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all add-legend-button";

      const icon = document.createElement("i");
      icon.className = "fas fa-plus text-white/90 group-hover:text-white transition-colors";

      const buttonText = document.createElement("span");
      buttonText.className = "text-sm font-medium text-white/90 group-hover:text-white";
      buttonText.textContent = "Ajouter une légende";

      addButton.appendChild(icon);
      addButton.appendChild(buttonText);

      addButton.addEventListener("click", () => {
         const modal = document.getElementById("createLegendModal");
         modal.classList.remove("hidden");
      });

      this.container.appendChild(addButton);
   }

   render(legend, matrix, path, name) {
      if (!this.container) return;
      this.container.innerHTML = "";
      legend.items.forEach((item, index) => {
         this.renderLegendItem(item, index, matrix, path, name);
      });
      this.renderAddLegendButton(path, name);
   }

   openEditModal(item, index, path, name) {
      const modal = document.getElementById("editLegendModal");
      const nameInput = modal.querySelector("#legendNameInput");
      const handsInput = modal.querySelector("#legendHandsInput");
      const saveButton = modal.querySelector("#saveLegendButton");

      if (!modal || !nameInput || !handsInput || !saveButton) {
         console.error("Modal ou champs introuvables");
         return;
      }

      nameInput.value = item.description;

      const associatedHands = this.currentMatrix
         .flat()
         .filter((cell) => cell.colors.includes(item.color))
         .map((cell) => cell.display_name);
      handsInput.value = associatedHands.join(", ");

      const adjustHeight = () => {
         handsInput.style.height = "36px";
         handsInput.style.height = Math.min(handsInput.scrollHeight, 96) + "px";
      };

      handsInput.addEventListener("input", adjustHeight);

      saveButton.onclick = async () => {
         const newDescription = nameInput.value.trim();
         const newHands = handsInput.value
            .split(',')
            .map((h) => h.trim())
            .filter((h) => h.length > 0);

         if (newDescription) {
            try {
               await this.updateLegendItem(path, name, index, {
                  description: newDescription,
                  pairs: newHands
               });
               modal.classList.add("hidden");
            } catch (error) {
               console.error("Erreur lors de la mise à jour de l'élément de légende :", error);
            }
         } else {
            alert("Veuillez entrer une description valide.");
         }
      };

      modal.classList.remove("hidden");
   }

}

export default Legend;