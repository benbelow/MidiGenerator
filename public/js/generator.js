var scales = require('./scales.js');
var MidiWriter = require('midi-writer-js');
var chords = require('./chords.js');
var notes = require('./notes.js');
var random = require('./random.js');

var NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
var DURATIONS = ["1", "2", "d2", "4", "d4", "8", "8t", "d8", "16"];
var durationsInFortyEighths = {"1" : 48, "2" : 24, "d2" : 36, "4" : 12, "d4" : 18, "8" : 6, "8t" : 4, "d8" : 9, "16" : 3};
var ionianSteps = [2, 2, 1, 2, 2, 2, 1];
var dorianSteps = [2, 1, 2, 2, 2, 1, 2];
var phrygianSteps = [1, 2, 2, 2, 1, 2, 2];
var lydianSteps = [2, 2, 2, 1, 2, 2, 1];
var mixolydianSteps = [2, 2, 1, 2, 2, 1, 2];
var aeolianSteps = [2, 1, 2, 2, 1, 2, 2];
var locrianSteps = [1, 2, 2, 1, 2, 2, 2];
var majorBluesSteps = [2,1,2,1,3,1,2];
modes = {"Ionian" : ionianSteps, "Dorian" : dorianSteps, "Phrygian" : phrygianSteps, "Lydian" : lydianSteps, "Mixolydian" : mixolydianSteps, "Aeolian" : aeolianSteps, "Locrian" : locrianSteps, "Major Blues" : majorBluesSteps
};


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

// This requires manual editing of the midi-writer-js library until PR is merged
function midiRest(duration){
    return new MidiWriter.NoteEvent({
        pitch: ["C1"], duration: "0", wait: duration, sequential: false
    });
}

exports.generateMelody = function generateMelody() {
    var track = new MidiWriter.Track();
    track.setTempo(120);

    var root = new notes.Pitch(random.getRandomElementOfArray(NOTES), 3);
    var mode = random.getRandomElementOfArray(Object.keys(modes).map(function(x){return modes[x]}));
    var scale = new scales.Scale(mode, root);

    var sequence = new chords.generateSequence(scale, 8);

    for(var i=0; i<sequence.length;i++){
        track.addEvent(midiChord(sequence[i].chordNotes(), "4"));
        if(random.check(100)){
            playBeats(3);
        }
    }

    track.addEvent(midiChord(scale.tonicChord().chordNotes(), "1"));

    console.log(root.note + " " + Object.keys(modes).filter(function(x){return modes[x] == mode}));

    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

    var write = new MidiWriter.Writer([track]);
    var data = 'data:audio/midi;base64,' + write.base64();
    return data;

    function playAPhrase(maxNumberOfNotes){
        var numberOfNotes = random.getRandomNumberInRange(2,maxNumberOfNotes);
        for (var i = 0; i < numberOfNotes; i++) {
            var note = scale.getRandomNote();
            var duration = random.getRandomElementOfArray(DURATIONS);
            track.addEvent(midiNote(note, duration));
        }
    }

    function playABar(){
        playBeats(4);
    }

    function playBeats(numberOfBeats){
        var numberOfTwelfthBeats = numberOfBeats * 12;
        var allowedValues = Object.keys(durationsInFortyEighths);
        var durations = [];
        var sumOfDurations = 0;
        while (sumOfDurations < numberOfTwelfthBeats){
            if(numberOfTwelfthBeats - sumOfDurations == 5 || numberOfTwelfthBeats - sumOfDurations < 3){
                //Gone wrong, start again. There's probably a better algorithm than this, but hey it's really late, ok.
                playBeats(numberOfBeats);
                return;
            }
            var durationToAdd = random.getRandomElementOfArray(allowedValues);
            var durationToAddInFortyEighths = durationsInFortyEighths[durationToAdd];
            while(numberOfTwelfthBeats - sumOfDurations < durationToAddInFortyEighths){
                durationToAdd = random.getRandomElementOfArray(allowedValues);
                durationToAddInFortyEighths = durationsInFortyEighths[durationToAdd];

            }
            durations.push(durationToAdd);
            sumOfDurations += durationToAddInFortyEighths;
        }

        for(var i=0;i<durations.length;i++){
            var pitch = scale.getRandomNote();
            if(random.check(12)){
                track.addEvent(midiRest(durations[i]));
            } else{
                track.addEvent(midiNote(pitch, durations[i]));
            }
        }
    }

};

