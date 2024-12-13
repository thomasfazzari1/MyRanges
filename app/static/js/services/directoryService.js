class DirectoryService {
   constructor() {
      this.abortController = null;
   }

   async fetchDirectory(path) {
      try {
         const fullPath = Array.isArray(path) ? path.join('/') : path;
         const response = await fetch(`/api/directory/${fullPath}`);
         return await response.json();
      } catch (error) {
         console.error('Une erreur est survenue lors de la récupération du dossier : ', error);
         throw error;
      }
   }

   async createItem(path, type, name) {
      try {
         const response = await fetch('/api/create', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               type,
               name,
               path
            })
         });
         return response.ok;
      } catch (error) {
         console.error("Une erreur est survenue lors de la création de l'item : ", error);
         throw error;
      }
   }

   async renameItem(path, oldName, newName) {
      try {
         const response = await fetch('/api/rename', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               path,
               oldName,
               newName
            }),
         });
         return response.ok;
      } catch (error) {
         console.error("Une erreur est survenu elors du renommage : ", error);
         throw error;
      }
   }

   async deleteItem(path, name) {
      try {
         const response = await fetch('/api/delete', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               path,
               name
            }),
         });
         return response.ok;
      } catch (error) {
         console.error("Une erreur est survenue lors de la suppression de l'item : ", error);
         throw error;
      }
   }

   async fetchRange(path, name) {
      try {
         console.log('Fetching range with path:', path, 'and name:', name);

         const response = await fetch('/api/range', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               path,
               name
            })
         });

         if (!response.ok) {
            throw new Error(`Impossible de récupérer le range : ${[...path, name].join('/')}`);
         }
         const data = await response.json();
         return data;
      } catch (error) {
         console.error('Une erreur est survenue lors de la récupération de la range : ', error);
         throw error;
      }
   }


   async updateLegendItem(path, name, index, updates) {
      if (this.abortController) {
         this.abortController.abort();
      }

      this.abortController = new AbortController();
      const signal = this.abortController.signal;

      try {
         const response = await fetch('/api/update_legend', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               path,
               name,
               index,
               ...updates
            }),
            signal,
         });

         if (!response.ok) {
            throw new Error('Impossible de mettre à jour la légende.');
         }
         console.log('Légende mise à jour avec succès.');
      } catch (error) {
         if (error.name === 'AbortError') {
            console.log('Requête annulée.');
         } else {
            console.error('Une erreur est survenue lors de la mise à jour de la légende.', error);
         }
      }
   }

   async addLegendItem(path, name, color, description) {
      try {
         const response = await fetch('/api/add_legend_item', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               path,
               name,
               color,
               description
            })
         });
         if (!response.ok) {
            throw new Error("Impossible d'ajouter la légende.");
         }
      } catch (error) {
         console.error("Une erreur est survenue lors de l'ajout de la légende : ", error);
      }
   }

   async deleteLegendItem(path, name, index) {
      try {
         const response = await fetch('/api/delete_legend_item', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               path,
               name,
               index
            })
         });
         if (!response.ok) {
            throw new Error('Impossible de supprimer la légende.');
         }
      } catch (error) {
         console.error('Une erreur est survenue lors de la suppression de la légende : ', error);
      }
   }
}

export default DirectoryService;