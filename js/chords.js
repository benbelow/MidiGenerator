var notes = require("./notes.js");
var helpers = require("./helpers.js");
var random = require("./random.js");

var chordTypes = {"M": [4, 7], "m": [3, 7]};

exports.Chord = function (pitches) {
    this.root = pitches[0];
    this.pitches = pitches;

    this.chordNotes = function () {
        return this.pitches;
    };

    this.addPitch = function(pitch){
        if(this.pitches.indexOf(pitch) < 0){
            this.pitches.push(pitch);
        }
        return this;
    };
};

exports.fromName = function (root, chordType) {
    var intervals = chordTypes[chordType];
    var pitches = [root];

    for (var i = 0; i < intervals.length; i++) {
        pitches.push(notes.duplicatePitch(root).transpose(intervals[i]));
    }

    return new module.exports.Chord(pitches);
};

exports.generateSequence = function(scale, length){
    var initialChord = random.check(80) ? scale.tonicChord() : scale.dominantChord();
    var chords = [initialChord];
    for(var i=0; i<length-1; i++){
        var lastChord = helpers.lastItemInList(chords);
        var allowedChords = [];
        switch(lastChord.root.note){
            case scale.tonicChord().root.note:
                chords.push(scale.getRandomChord());
                break;
            case scale.supertonicChord().root.note:
                allowedChords = [scale.leadingToneChord(), scale.dominantChord()];
                chords.push(random.getRandomElementOfArray(allowedChords));
                break;
            case scale.mediantChord().root.note:
                allowedChords = [scale.submediantChord(), scale.subdominantChord()];
                chords.push(random.getRandomElementOfArray(allowedChords));
                break;
            case scale.subdominantChord().root.note:
                allowedChords = [scale.supertonicChord(), scale.leadingToneChord(), scale.dominantChord()];
                chords.push(random.getRandomElementOfArray(allowedChords));
                break;
            case scale.dominantChord().root.note:
                chords.push(scale.tonicChord());
                break;
            case scale.submediantChord().root.note:
                allowedChords = [scale.subdominantChord(), scale.supertonicChord(), scale.dominantChord()];
                chords.push(random.getRandomElementOfArray(allowedChords));
                break;
            case scale.leadingToneChord().root.note:
                chords.push(scale.tonicChord());
                break;
            default:
                chords.push(scale.tonicChord());
        }
    }
    return chords;
};