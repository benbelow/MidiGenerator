var NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

exports.NOTES = NOTES;

exports.Pitch = function (note, octave) {
    this.note = note;
    this.octave = octave;

    this.noteString = function () {
        return this.note + this.octave;
    };

    this.isHigherThan = function (pitch) {
        return this.interval(pitch) > 1;
    };

    this.isLowerThan = function (pitch) {
        return this.interval(pitch) < 1;
    };

    this.transpose = function (semitoneNumber) {
        if(semitoneNumber > 12){
            return this.transpose(12).transpose(semitoneNumber - 12);
        }
        if(semitoneNumber < -12){
            return this.transpose(-12).transpose(semitoneNumber + 12);
        }
        var newPitch = module.exports.duplicatePitch(this);
        var noteIndex = NOTES.indexOf(newPitch.note);
        var newIndex = noteIndex + semitoneNumber;
        if (newIndex >= NOTES.length) {
            newIndex -= NOTES.length;
            newPitch.octave++;
        }
        if (newIndex < 0) {
            newIndex += NOTES.length;
            newPitch.octave--;
        }
        newPitch.note = NOTES[newIndex];
        return newPitch;
    };

    this.interval = function(pitch){
        var noteIndex= NOTES.indexOf(this.note);
        var pitchNoteIndex = NOTES.indexOf(pitch.note);
        var pitchDifference = noteIndex - pitchNoteIndex;
        var octaveDifference = this.octave - pitch.octave;

        return pitchDifference + (octaveDifference * NOTES.length);
    }
};

exports.duplicatePitch = function (pitch) {
    return new module.exports.Pitch(pitch.note, pitch.octave);
};
