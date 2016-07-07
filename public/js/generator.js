var MidiWriter = require('midi-writer-js');

var notes = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
var octaves = ["1", "2", "3", "4", "5", "6"];
var durations = ["1","2","d2","4","d4","8","8t","d8","16"];
var ionianSteps = [2, 2, 1, 2, 2, 2, 1];
var dorianSteps = [2, 1, 2, 2, 2, 1, 2];
var phrygianSteps = [1, 2, 2, 2, 1, 2, 2];
var lydianSteps = [2, 2, 2, 1, 2, 2, 1];
var mixolydianSteps = [2, 2, 1, 2, 2, 1, 2];
var aeolianSteps = [2, 1, 2, 2, 1, 2, 2];
var locrianSteps = [1, 2, 2, 1, 2, 2, 2];

function Pitch(note, octave) {
    this.note = note;
    this.octave = octave;

    this.noteString = function () {
        return this.note + this.octave;
    };

    this.addSemitones = function (semitoneNumber) {
        var noteIndex = notes.indexOf(note);
        var newIndex = noteIndex + semitoneNumber;
        if (newIndex >= notes.length) {
            newIndex -= notes.length;
            this.octave++;
        }
        if (newIndex < 0) {
            newIndex += notes.length;
            this.octave--;
        }
        this.note = notes[newIndex];
    }
}

function Scale(steps, root) {
    this.steps = steps;
    this.root = root;
    this.notes;

    this.getNotes = function () {
        if (this.notes != null) {
            return this.notes;
        }
        var scaleNotes = [this.root];
        for (var i = 0; i < this.steps.length; i++) {
            var lastNote = scaleNotes.slice(-1)[0];
            var newNote = new Pitch(lastNote.note, lastNote.octave);
            newNote.addSemitones(this.steps[i]);
            scaleNotes.push(newNote);
        }
        return scaleNotes;
    };

    this.getRandomNote = function () {
        return getRandomElementOfArray(this.getNotes());
    }

}

function midiNote(note, duration){
    return new MidiWriter.NoteEvent({pitch: [note], duration: duration, sequential: true});
}

function midiPhrase(notes, duration){
    return new MidiWriter.NoteEvent({pitch: notes, duration: duration, sequential: true});
}

function midiChord(notes, duration){
    return new MidiWriter.NoteEvent({pitch: notes, duration: duration, sequential: false});
}

exports.generateMelody = function generateMelody() {
    var track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

    var root = new Pitch("C#", 4);
    var scale = new Scale(dorianSteps, root);

    for (var i = 0; i < scale.getNotes().length; i++) {
        var note = scale.getRandomNote();
        var duration = getRandomElementOfArray(durations);
        track.addEvent(midiNote(note.noteString(), duration));
    }

    var write = new MidiWriter.Writer([track]);
    var data = 'data:audio/midi;base64,' + write.base64()
    console.log(data);
    return data;
};

function getRandomNumberInRange(min, max) {
    return Math.floor((Math.random() * max) + min);
}

function getRandomElementOfArray(array){
    return array[getRandomNumberInRange(0,array.length)];
}