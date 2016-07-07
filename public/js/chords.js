var notes = require("./notes.js");

var chordTypes = {"M": [4,7], "m": [3,7]};

exports.Chord = function (root, chordType) {
    this.root = root;
    var intervals = chordTypes[chordType];
    this.pitches = [root];
    for(var i=0; i<intervals.length; i++){
        this.pitches.push(notes.duplicatePitch(root).addSemitones(intervals[i]));
    }

    this.chordNotes = function() {
        return this.pitches;
    }
};
