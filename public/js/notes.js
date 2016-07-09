var NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

exports.Pitch = function (note, octave) {
    this.note = note;
    this.octave = octave;

    this.noteString = function () {
        return this.note + this.octave;
    };

    this.isHigherThan = function (pitch) {
        if (this.octave > pitch.octave) {
            return true;
        } else if (this.octave == pitch.octave) {
            return NOTES.indexOf(this.note) > NOTES.indexOf(pitch.note);
        } else {
            return false;
        }
    };

    this.transpose = function (semitoneNumber) {
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
    }
};

exports.duplicatePitch = function (pitch) {
    return new module.exports.Pitch(pitch.note, pitch.octave);
};
