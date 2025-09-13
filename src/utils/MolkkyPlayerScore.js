class MolkkyPlayerScore {
    /**
     * This entire class is for figuring out what the 
     * final score should be after we are backtracking with
     * "Peruuta" button. Specifically for figuring out when
     * the player was dropped down to 25 points. This might
     * happed multiple times during a game and just counting
     * points is unreliable without further context.
     * 
     * When the entire logic is synchronized with backend
     * we need to clean up the logic. Molkky.js is an absolute
     * nightmare.
     */
    
    constructor(player) {
        this.player = player;
        this.scores = [];
    }

    addScore(score){
        this.scores.push(score);
    }
    removeScore(){
        this.scores.pop();
    }

    returnStrikes(){
        this.strikes = 0;
        this.scores.forEach((score) => {
            if(score === 0) {
                this.strikes++;
            } else {
                this.strikes = 0;
            }
        });
        return this.strikes;
    }

    returnScore(){
        let totalScore = 0;
        this.scores.forEach((score) => {
            totalScore += score;
            if (totalScore > 50) {
                totalScore = 25;
            }
        });
        return totalScore;
    }
}

export default MolkkyPlayerScore; 