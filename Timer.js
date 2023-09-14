export class Timer {
    constructor(minutes, seconds, startTime, spawnItem, placeIndex) {
        this.placeIndex = placeIndex;
        this.spawnItem = spawnItem;
        this.seconds = 0;
        while (minutes !== 0) {
            this.seconds += 60
            minutes--; 
        }
        this.seconds += seconds;
        this.startTime = startTime;
    }

    getTime(timeNow) {
        const minusSeconds = parseInt((timeNow - this.startTime) * 0.001);
        let seconds = this.seconds - minusSeconds;
        if (seconds <= 0) {
            return "Ready to harvest";
        }
        var minutes = 0;
        while (seconds > 59) {
            minutes += 1;
            seconds -= 60;
        }
        var zeroMin = minutes < 10 ? '0' : '';
        var zeroSec = seconds < 10 ? '0' : '';
        return `${zeroMin}${minutes}:${zeroSec}${seconds}`;
    }
}