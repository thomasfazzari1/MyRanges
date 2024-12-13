class EquityService {
    async calculateEquity(hands, board, iterations = 10000) {
        try {
            const response = await fetch('/api/calculate_equity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hands,
                    board,
                    iterations
                })
            });

            if (!response.ok) {
                throw new Error("Impossible de calculer l'équité");
            }

            return await response.json();
        } catch (error) {
            console.error("Une erreur est survenue lors du calcul de l'équité : ", error);
            throw error;
        }
    }
}

export default EquityService;