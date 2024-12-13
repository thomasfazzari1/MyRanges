class Explorer {
   constructor(directoryService, onRangeSelected) {
      this.directoryService = directoryService;
      this.onRangeSelected = onRangeSelected;
      this.currentPath = [];
      this.rootName = "Mes Ranges";
      this.positionFilter = "ALL";
      this.selectedRange = null;

      this.initializeEventListeners();
      this.loadCurrentDirectory();
      this.updateGlobalStats();
   }

   initializeEventListeners() {
      document.getElementById('createItemBtn').addEventListener('click', () => {
         this.showCreateModal();
      });

      document.getElementById('cancelCreate').addEventListener('click', () => {
         this.hideCreateModal();
      });

      document.getElementById('confirmCreate').addEventListener('click', () => {
         this.createNewItem();
      });

      const typeButtons = document.querySelectorAll('.type-btn');
      typeButtons.forEach(button => {
         button.addEventListener('click', () => {
            this.selectType(button);
         });
      });

      const customSelect = document.getElementById('customSelect');
      const dropdown = document.getElementById('dropdown');
      const selectedText = document.getElementById('selectedText');

      customSelect.addEventListener('click', (e) => {
         e.stopPropagation();
         dropdown.classList.toggle('hidden');
         customSelect.classList.toggle('ring-2');
         customSelect.classList.toggle('ring-blue-500/20');
      });

      document.addEventListener('click', () => {
         dropdown.classList.add('hidden');
         customSelect.classList.remove('ring-2');
         customSelect.classList.remove('ring-blue-500/20');
      });

      dropdown.querySelectorAll('[data-value]').forEach(option => {
         option.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = option.dataset.value;
            selectedText.textContent = option.textContent;
            dropdown.classList.add('hidden');
            customSelect.classList.remove('ring-2');
            customSelect.classList.remove('ring-blue-500/20');
            this.setPositionFilter(value);
         });
      });
   }

   setPositionFilter(position) {
      this.positionFilter = position;
      this.loadCurrentDirectory();
   }

   selectType(selectedButton) {
      const typeButtons = document.querySelectorAll('.type-btn');
      typeButtons.forEach(button => {
         if (button === selectedButton) {
            button.classList.add('selected');
         } else {
            button.classList.remove('selected');
         }
      });

      const selectedType = selectedButton.getAttribute('data-type');
      document.getElementById('itemType').value = selectedType;
   }

   showActionMenu(event, name, item, parentElement) {
      const existingMenu = document.getElementById('actionMenu');
      if (existingMenu) existingMenu.remove();

      const menu = document.createElement('div');
      menu.id = 'actionMenu';
      menu.className = 'absolute bg-gray-800 text-white rounded shadow-lg p-2 z-50';
      menu.style.top = `${event.clientY}px`;
      menu.style.left = `${event.clientX}px`;

      const renameOption = document.createElement('div');
      renameOption.textContent = 'Renommer';
      renameOption.className = 'p-2 hover:bg-blue-700 rounded cursor-pointer';
      renameOption.onclick = () => {
         this.showEditModal(name, item);
         menu.remove();
      };

      const deleteOption = document.createElement('div');
      deleteOption.textContent = 'Supprimer';
      deleteOption.className = 'p-2 hover:bg-blue-700 rounded cursor-pointer';
      deleteOption.onclick = async () => {
         const confirmation = confirm('Êtes-vous sûr de vouloir supprimer cet élément ?');
         if (confirmation) {
            try {
               await this.directoryService.deleteItem(this.currentPath, name);
               await this.loadCurrentDirectory();
               this.updateGlobalStats();
            } catch (error) {
               console.error("Erreur lors de la suppression de l'item :", error);
               alert('Une erreur est survenue lors de la suppression de l\'élément.');
            }
         }
         menu.remove();
      };

      menu.appendChild(renameOption);
      menu.appendChild(deleteOption);
      document.body.appendChild(menu);

      const removeMenu = () => {
         menu.remove();
         document.removeEventListener('click', removeMenu);
      };
      document.addEventListener('click', removeMenu, {
         once: true
      });
   }

   showEditModal(name, item) {
      const modal = document.getElementById('editModal');
      const nameInput = document.getElementById('editItemName');
      const saveButton = document.getElementById('saveEdit');
      const cancelButton = document.getElementById('cancelEdit');

      if (!modal || !nameInput || !saveButton || !cancelButton) {
         console.error('Modale ou champs introuvables');
         return;
      }

      nameInput.value = name;

      modal.classList.remove('hidden');

      saveButton.onclick = async () => {
         const newName = nameInput.value.trim();
         if (newName && newName !== name) {
            try {
               await this.directoryService.renameItem(this.currentPath, name, newName);
               await this.loadCurrentDirectory();
               this.updateGlobalStats();
            } catch (error) {
               console.error('Une erreur est survenue lors du renommage :', error);
               alert('Une erreur est survenue lors du renommage.');
            }
         }
         modal.classList.add('hidden');
      };

      cancelButton.onclick = () => {
         modal.classList.add('hidden');
      };
   }


   async updateGlobalStats() {
      try {
         const data = await this.directoryService.fetchDirectory("");
         const stats = this.calculateStatsRecursive(data);

         document.getElementById('totalSections').textContent = stats.sectionCount;
         document.getElementById('totalRanges').textContent = stats.rangeCount;
      } catch (error) {
         console.error("Erreur lors de la récupération des statistiques globales :", error);
      }
   }

   updateLocalStats(items) {
      const rangeCount = Object.values(items).filter((item) => item.type === 'range').length;
      document.getElementById('currentRanges').textContent = rangeCount;
   }


   calculateStatsRecursive(data) {
      let rangeCount = 0;
      let sectionCount = 0;

      const traverse = (items) => {
         for (const item of Object.values(items)) {
            if (item.type === 'range') {
               rangeCount++;
            } else if (item.type === 'container') {
               sectionCount++;
               if (item.items) {
                  traverse(item.items);
               }
            }
         }
      };

      traverse(data);
      return {
         rangeCount,
         sectionCount
      };
   }

   async loadCurrentDirectory() {
      try {
         const data = await this.directoryService.fetchDirectory(this.getPathString());
         const filteredData = this.filterItems(data);
         this.renderDirectory(filteredData);
         this.updatePathDisplay();
         this.updateLocalStats(filteredData);
      } catch (error) {
         console.error('Une erreur est survenue lors du chargement du dossier :', error);
      }
   }

   filterItems(items) {
      if (this.positionFilter === 'ALL') return items;

      const filteredItems = {};
      for (const [name, item] of Object.entries(items)) {
         if (item.type === 'container') {
            filteredItems[name] = item;
         } else if (item.type === 'range' && name.includes(this.positionFilter)) {
            filteredItems[name] = item;
         }
      }
      return filteredItems;
   }

   showCreateModal() {
      const createModal = document.getElementById('createModal');
      createModal.classList.remove('hidden');

      document.getElementById('itemType').value = 'container';

      const typeButtons = document.querySelectorAll('.type-btn');
      typeButtons.forEach(button => {
         if (button.getAttribute('data-type') === 'container') {
            button.classList.add('selected');
         } else {
            button.classList.remove('selected');
         }
      });

      document.getElementById('itemName').value = '';
   }

   hideCreateModal() {
      document.getElementById('createModal').classList.add('hidden');
   }

   getPathString() {
      return '/' + this.currentPath.join('/');
   }

   updatePathDisplay() {
      const pathElement = document.getElementById('currentPath');
      pathElement.innerHTML = '';

      const pathContainer = document.createElement('div');
      pathContainer.className = 'flex flex-wrap items-center gap-2';

      const rootLink = document.createElement('a');
      rootLink.textContent = this.rootName;
      rootLink.className = 'text-blue-400 hover:text-blue-300 cursor-pointer shrink-0 transition-colors';
      rootLink.onclick = () => this.navigateToPath([]);
      pathContainer.appendChild(rootLink);

      let currentPath = [];
      this.currentPath.forEach((segment) => {
         currentPath.push(segment);

         const arrowSpan = document.createElement('span');
         arrowSpan.innerHTML = '<i class="fas fa-chevron-right text-gray-500 shrink-0"></i>';
         pathContainer.appendChild(arrowSpan);

         const segmentLink = document.createElement('a');
         segmentLink.textContent = segment;
         segmentLink.className = 'text-gray-300 hover:text-white cursor-pointer shrink-0 transition-colors';

         const pathForNavigation = [...currentPath];
         segmentLink.onclick = () => this.navigateToPath(pathForNavigation);

         pathContainer.appendChild(segmentLink);
      });

      pathElement.appendChild(pathContainer);
   }

   navigateToPath(newPath) {
      this.currentPath = newPath;
      this.loadCurrentDirectory();
   }

   renderDirectory(items) {
      const treeRoot = document.getElementById('treeRoot');
      treeRoot.innerHTML = '';

      if (this.currentPath.length > 0) {
         treeRoot.appendChild(this.createBackButton());
      }

      if (Object.keys(items).length === 0) {
         const emptyMessage = document.createElement('div');
         emptyMessage.className = 'text-gray-400 text-center py-4';
         emptyMessage.textContent = this.positionFilter === 'ALL' ?
            'Aucun élément.' :
            `Aucune range ${this.positionFilter} trouvée.`;
         treeRoot.appendChild(emptyMessage);
         return;
      }

      for (const [name, item] of Object.entries(items)) {
         treeRoot.appendChild(this.createItemElement(name, item));
      }
   }

   createBackButton() {
      const div = document.createElement('div');
      div.className = 'flex items-center space-x-2 p-2 hover:bg-gray-700/50 rounded cursor-pointer text-gray-400';

      const icon = document.createElement('i');
      icon.className = 'fas fa-arrow-left';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = 'Retour';
      nameSpan.className = 'text-sm';

      div.appendChild(icon);
      div.appendChild(nameSpan);

      div.addEventListener('click', () => this.navigateBack());

      return div;
   }

   isSelected(name, item) {
      if (item.type === 'container') {
         return this.currentPath[this.currentPath.length - 1] === name;
      } else if (item.type === 'range') {
         return this.selectedRange && this.selectedRange.name === name;
      }
      return false;
   }

   createItemElement(name, item) {
      const div = document.createElement('div');
      div.className = `flex items-center justify-between p-2 hover:bg-gray-700/50 rounded ${this.isSelected(name, item) ? 'bg-blue-600' : ''}`;

      const content = document.createElement('div');
      content.className = 'flex items-center space-x-2';

      const icon = document.createElement('i');
      icon.className = item.type === 'container' ? 'fas fa-folder' : 'fas fa-database';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = name;
      nameSpan.className = 'text-sm no-select';

      content.appendChild(icon);
      content.appendChild(nameSpan);

      div.addEventListener('click', (event) => {
         if (event.target.closest('button')) return;
         this.handleItemClick(name, item);
      });

      const actionButton = document.createElement('button');
      actionButton.className = 'text-gray-400 hover:text-blue-400 transition-colors';
      actionButton.innerHTML = '<i class="fas fa-ellipsis-v"></i>';

      actionButton.addEventListener('click', (event) => {
         event.stopPropagation();
         this.showActionMenu(event, name, item, div);
      });

      div.appendChild(content);
      div.appendChild(actionButton);

      return div;
   }

   navigateBack() {
      this.currentPath.pop();
      this.loadCurrentDirectory();
   }

   async handleItemClick(name, item) {
      if (item.type === "container") {
         this.currentPath.push(name);
         this.selectedRange = null;
         await this.loadCurrentDirectory();
      } else if (item.type === "range") {
         const rangeData = await this.directoryService.fetchRange(this.currentPath, name);
         this.selectedRange = {
            name,
            data: rangeData
         };
         if (this.onRangeSelected) {
            this.onRangeSelected(name, rangeData, this.currentPath);
         }
         await this.loadCurrentDirectory();
      }
   }

   async createNewItem() {
      const type = document.getElementById('itemType').value;
      const name = document.getElementById('itemName').value;

      if (!name) {
         alert('Le nom est requis.');
         return;
      }

      try {
         const success = await this.directoryService.createItem(this.currentPath, type, name);
         if (success) {
            this.hideCreateModal();
            document.getElementById('itemName').value = '';
            await this.loadCurrentDirectory();
            this.updateGlobalStats();
         } else {
            alert('Échec de la création de l\'élément.');
         }
      } catch (error) {
         console.error("Erreur lors de la création de l'item :", error);
         alert('Une erreur est survenue lors de la création de l\'élément.');
      }
   }
}

export default Explorer;