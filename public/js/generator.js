var scales = require('./scales.js');
var MidiWriter = require('midi-writer-js');
var chords = require('./chords.js');
var notes = require('./notes.js');
var random = require('./random.js');

var DURATIONS = ["1", "2", "d2", "4", "d4", "8", "8t", "d8", "16"];
var ionianSteps = [2, 2, 1, 2, 2, 2, 1];
var dorianSteps = [2, 1, 2, 2, 2, 1, 2];
var phrygianSteps = [1, 2, 2, 2, 1, 2, 2];
var lydianSteps = [2, 2, 2, 1, 2, 2, 1];
var mixolydianSteps = [2, 2, 1, 2, 2, 1, 2];
var aeolianSteps = [2, 1, 2, 2, 1, 2, 2];
var locrianSteps = [1, 2, 2, 1, 2, 2, 2];


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
    var root = new notes.Pitch("G#", 3);
    var scale = new scales.Scale(phrygianSteps, root);


    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));
    // for (var i = 0; i < scale.getLength(); i++) {
    //     var note = scale.getRandomNote();
    //     var duration = random.getRandomElementOfArray(DURATIONS);
    //     track.addEvent(midiNote(note, duration));
    // }
    track.addEvent(midiChord(new scale.tonicChord(), 2));
    track.addEvent(midiChord(new scale.getRandomChord(), 2));
    track.addEvent(midiChord(new scale.getRandomChord(), 2));
    track.addEvent(midiChord(new scale.getRandomChord(), 2));
    track.addEvent(midiChord(new scale.getRandomChord(), 2));
    track.addEvent(midiChord(new scale.getRandomChord(), 2));
    track.addEvent(midiChord(new scale.getRandomChord(), 2));
    track.addEvent(midiChord(new scale.tonicChord(), 2));

    var write = new MidiWriter.Writer([track]);
    var data = 'data:audio/midi;base64,' + write.base64();
    console.log(data);
    return data;
}

