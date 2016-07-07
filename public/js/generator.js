var MidiWriter = require('midi-writer-js');
var chords = require('./chords.js');
var notes = require('./notes.js');

var DURATIONS = ["1", "2", "d2", "4", "d4", "8", "8t", "d8", "16"];
var ionianSteps = [2, 2, 1, 2, 2, 2, 1];
var dorianSteps = [2, 1, 2, 2, 2, 1, 2];
var phrygianSteps = [1, 2, 2, 2, 1, 2, 2];
var lydianSteps = [2, 2, 2, 1, 2, 2, 1];
var mixolydianSteps = [2, 2, 1, 2, 2, 1, 2];
var aeolianSteps = [2, 1, 2, 2, 1, 2, 2];
var locrianSteps = [1, 2, 2, 1, 2, 2, 2];


function Scale(steps, root) {
    this.steps = steps;
    this.root = root;
    this.setUpNotes = function () {
        var scaleNotes = [this.root];
        for (var i = 0; i < this.steps.length; i++) {
            var lastNote = scaleNotes.slice(-1)[0];
            var newNote = notes.duplicatePitch(lastNote);
            newNote.addSemitones(this.steps[i]);
            scaleNotes.push(newNote);
        }
        return scaleNotes;
    };
    this.notes = this.setUpNotes();

    this.getLength = function () {
        return this.notes.length;
    };

    this.getRandomNote = function () {
        return getRandomElementOfArray(this.notes);
    };
}

function midiNote(note, duration) {
    return new MidiWriter.NoteEvent({pitch: [note.noteString()], duration: duration, sequential: true});
}

function midiPhrase(notes, duration) {
    return new MidiWriter.NoteEvent({
        pitch: notes.map(function (x) {
            return x.noteString();
        }), duration: duration, sequential: true
    });
}

function midiChord(notes, duration) {
    return new MidiWriter.NoteEvent({
        pitch: notes.map(function (x) {
            return x.noteString();
        }), duration: duration, sequential: false
    });
}

exports.generateMelody = function generateMelody() {
    var track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

    var root = new notes.Pitch("C", 4);
    var scale = new Scale(mixolydianSteps, root);

    for (var i = 0; i < scale.getLength(); i++) {
        var note = scale.getRandomNote();
        var duration = getRandomElementOfArray(DURATIONS);
        track.addEvent(midiNote(note, duration));
        track.addEvent(midiChord(new chords.Chord(root, "m").chordNotes(), 2));
    }

    var write = new MidiWriter.Writer([track]);
    var data = 'data:audio/midi;base64,' + write.base64()
    console.log(data);
    return data;
};

function getRandomNumberInRange(min, max) {
    return Math.floor((Math.random() * max) + min);
}

function getRandomElementOfArray(array) {
    return array[getRandomNumberInRange(0, array.length)];
}