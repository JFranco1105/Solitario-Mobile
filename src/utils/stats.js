export const stats = {
    getGamesPlayed() {
        return parseInt(localStorage.getItem('solitaire_games') || '0', 10);
    },
    incrementGamesPlayed() {
        const current = this.getGamesPlayed();
        localStorage.setItem('solitaire_games', current + 1);
    },
    getBestTime() {
        return localStorage.getItem('solitaire_best_time') || null;
    },
    saveTime(seconds) {
        const best = this.getBestTime();
        if (!best || seconds < parseInt(best, 10)) {
            localStorage.setItem('solitaire_best_time', seconds);
        }
    },
    formatTime(totalSeconds) {
        if (!totalSeconds) return '--:--';
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }
};