var NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

exports.Pitch = function (note, octave) {
    this.note = note;
    this.octave = octave;

    this.noteString = function () {
        return this.note + this.octave;
    };

    this.addSemitones = function (semitoneNumber) {
        var noteIndex = NOTES.indexOf(note);
        var newIndex = noteIndex + semitoneNumber;
        if (newIndex >= NOTES.length) {
            newIndex -= NOTES.length;
            this.octave++;
        }
        if (newIndex < 0) {
            newIndex += NOTES.length;
            this.octave--;
        }
        this.note = NOTES[newIndex];
        return this;
    }
};

exports.duplicatePitch = function(pitch){
    return new this.Pitch(pitch.note, pitch.octave);
};
