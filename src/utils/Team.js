class Team {
  constructor(team) {
    this.id = team.id;
    this.name = team.name;
    this.members = team.members || [];
    this.currentPlayer = 0;
  }

  nextPlayer() {
    this.currentPlayer++;
    if (this.currentPlayer >= this.members.length) {
      this.currentPlayer = 0;
    }
  }

  previousPlayer() {
    this.currentPlayer--;
    if (this.currentPlayer < 0) {
      this.currentPlayer = this.members.length - 1;
    }
  }

  returnCurrentPlayer() {
    return this.members[this.currentPlayer];
  }

  getName() {
    return this.name;
  }
}

export default Team;