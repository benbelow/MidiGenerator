var MidiWriter = require('midi-writer-js');

var notes = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
var octaves = ["1", "2", "3", "4", "5", "6"];
var ionianSteps = [2,2,1,2,2,2,1];
var dorianSteps = [2,1,2,2,2,1,2];
var phrygianSteps = [1,2,2,2,1,2,2];
var lydianSteps = [2,2,2,1,2,2,1];
var mixolydianSteps = [2,2,1,2,2,1,2];
var aeolianSteps = [2,1,2,2,1,2,2];
var locrianSteps = [1,2,2,1,2,2,2];

function Pitch(note, octave){
    this.note = note;
    this.octave = octave;

    this.noteString = function(){
        return this.note + this.octave;
    };

    this.addSemitones = function(semitoneNumber){
        var noteIndex = notes.indexOf(note);
        var newIndex = noteIndex + semitoneNumber;
        if(newIndex >= notes.length){
            newIndex -= notes.length;
            this.octave++;
        }
        if(newIndex < 0){
            newIndex += notes.length;
            this.octave--;
        }
        this.note = notes[newIndex];
    }
}

function Scale(steps, root){
    this.steps = steps;
    this.root = root;

    this.getNotes = function(){
        var scaleNotes = [this.root];
        for(var i=0; i < this.steps.length; i++){
            var lastNote = scaleNotes.slice(-1)[0];
            var newNote = new Pitch(lastNote.note, lastNote.octave);
            newNote.addSemitones(this.steps[i]);
            scaleNotes.push(newNote);
        }
        return scaleNotes;
    }

}

exports.generateMelody = function generateMelody() {
    var track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

    var root = new Pitch("C#", 4);
    var dorian = new Scale(dorianSteps,root).getNotes();

    var notes = [root];

    for(var i=0; i < dorian.length; i++){
        var rand = getRandomNumberInRange(0,dorian.length);
        var oct = getRandomNumberInRange(2, 5);
        notes.push(dorian[rand]);
    }

    var playedNotes = notes.map(function(x){return x.noteString();});
    var noteEvent = new MidiWriter.NoteEvent({pitch: playedNotes, duration: '4', sequential: true});
    track.addEvent(noteEvent);

    var write = new MidiWriter.Writer([track]);
    var data = 'data:audio/midi;base64,' + write.base64()
    console.log(data);
    return data;
};

function getRandomNumberInRange(min, max) {
    return Math.floor((Math.random() * max) + min);
}
