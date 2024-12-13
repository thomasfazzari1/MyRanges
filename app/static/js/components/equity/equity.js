class Equity {
   constructor(equityService) {
      this.equityService = equityService;
      this.maxHands = 10;
      this.maxBoardCards = 5;
      this.initializeEventListeners();
      this.updateAddButtonState();
   }

   initializeEventListeners() {
      document.getElementById('addHand').addEventListener('click', () => this.addHandInput());
      document.getElementById('calculateButton').addEventListener('click', () => this.calculate());
      this.addRemoveHandListeners();
      document.getElementById('boardInput').addEventListener('input', () => this.validateBoardInput());
   }

   addHandInput() {
      const handInputs = document.getElementById('handInputs');
      const currentHands = handInputs.querySelectorAll('.hand-input').length;

      if (currentHands >= this.maxHands) {
         alert(`Vous ne pouvez ajouter que ${this.maxHands} mains au maximum.`);
         return;
      }

      const newInput = document.createElement('div');
      newInput.className = 'hand-input flex items-center gap-4';
      newInput.innerHTML = `
            <input type="text" class="hand flex-1 bg-gray-700 border border-gray-600 rounded p-2 text-white" placeholder="ex: AhKs" maxlength="4">
            <span class="equity-result text-blue-400 font-bold min-w-[80px] text-right"></span>
            <button class="remove-hand bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-1">-</button>
        `;
      handInputs.appendChild(newInput);
      this.addRemoveHandListeners();
      this.updateAddButtonState();
   }

   addRemoveHandListeners() {
      const removeButtons = document.querySelectorAll('.remove-hand');
      removeButtons.forEach(button => {
         button.removeEventListener('click', this.handleRemoveHand);
         button.addEventListener('click', (event) => this.handleRemoveHand(event));
      });
   }

   handleRemoveHand(event) {
      const handInput = event.target.closest('.hand-input');
      if (handInput) {
         handInput.remove();
         this.updateAddButtonState();
      }
   }

   async calculate() {
      const hands = Array.from(document.querySelectorAll('.hand')).map(input => {
         const parsedHand = this.parseHand(input.value);
         return parsedHand && parsedHand.length === 2 ? parsedHand : [];
      });

      const invalidHands = Array.from(document.querySelectorAll('.hand')).filter(input => {
         const parsedHand = this.parseHand(input.value);
         return input.value.trim() !== '' && (!parsedHand || parsedHand.length !== 2);
      });

      if (invalidHands.length > 0) {
         alert("Veuillez corriger les mains invalides avant de lancer la simulation.");
         return;
      }

      const boardInput = document.getElementById('boardInput').value;
      const board = this.parseBoard(boardInput);

      for (const card of board) {
         if (!this.isValidCard(card)) {
            alert(`Erreur : La carte "${card}" est invalide.`);
            return;
         }
      }

      const allCards = [...hands.flat(), ...board];
      const cardSet = new Set(allCards);
      if (cardSet.size !== allCards.length) {
         alert("Erreur : Une ou plusieurs cartes apparaissent plusieurs fois entre les mains et le tableau !");
         return;
      }

      const iterations = parseInt(document.getElementById('iterations').value, 10);
      console.log(`Calcul des équités pour les mains : ${JSON.stringify(hands)} avec le tableau : ${JSON.stringify(board)}`);

      try {
         const result = await this.equityService.calculateEquity(hands, board, iterations);
         this.displayResults(result);
      } catch (error) {
         alert(error.message);
      }
   }

   isValidCard(card) {
      const validRanks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
      const validSuits = ['h', 'd', 'c', 's'];
      if (card.length !== 2) return false;
      const [rank, suit] = card.split('');
      return validRanks.includes(rank.toUpperCase()) && validSuits.includes(suit.toLowerCase());
   }

   parseHand(input) {
      if (!input.trim()) return [];
      const matches = input.trim().match(/[AKQJT98765432][hdcs]/g);
      return matches && matches.length === 2 ? matches : null;
   }

   parseBoard(input) {
      if (!input.trim()) return [];
      const matches = input.trim().match(/[AKQJT98765432][hdcs]/g);
      return matches || [];
   }

   displayResults(result) {
      const equityResults = document.querySelectorAll('.equity-result');
      const handInputs = document.querySelectorAll('.hand');

      result.hand_equities.forEach((equity, index) => {
         if (handInputs[index] && handInputs[index].value.trim() === '') {
            equityResults[index].textContent = '';
         } else if (equityResults[index]) {
            equityResults[index].textContent = `${equity.toFixed(2)}%`;
         }
      });
   }

   updateAddButtonState() {
      const handInputs = document.getElementById('handInputs').querySelectorAll('.hand-input').length;
      const addButton = document.getElementById('addHand');

      if (handInputs >= this.maxHands) {
         addButton.disabled = true;
         addButton.classList.add('opacity-50', 'cursor-not-allowed');
         addButton.title = `Vous ne pouvez pas ajouter plus de ${this.maxHands} mains.`;
      } else {
         addButton.disabled = false;
         addButton.classList.remove('opacity-50', 'cursor-not-allowed');
         addButton.title = '';
      }
   }

   validateBoardInput() {
      const boardInput = document.getElementById('boardInput').value;
      const board = this.parseBoard(boardInput);
      const errorElement = document.getElementById('boardError');

      if (errorElement) {
         errorElement.remove();
      }

      for (const card of board) {
         if (!this.isValidCard(card)) {
            this.showBoardError(`La carte "${card}" est invalide.`);
            return;
         }
      }
   }

   showBoardError(message) {
      const boardInput = document.getElementById('boardInput');
      const errorElement = document.createElement('p');
      errorElement.id = 'boardError';
      errorElement.className = 'text-sm text-red-500 mt-2';
      errorElement.textContent = message;
      boardInput.parentNode.appendChild(errorElement);
   }

   showHandError(inputElement, message, errorId) {
      const errorElement = document.createElement('p');
      errorElement.id = errorId;
      errorElement.className = 'text-sm text-red-500 mt-1';
      errorElement.textContent = message;
      inputElement.parentNode.appendChild(errorElement);
   }
}

export default Equity;