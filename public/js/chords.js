var notes = require("./notes.js");

var chordTypes = {"M": [4, 7], "m": [3, 7]};

exports.Chord = function (pitches) {
    this.root = pitches[0];
    this.pitches = pitches;

    this.chordNotes = function () {
        return this.pitches;
    }
};

exports.fromName = function (root, chordType) {
    var intervals = chordTypes[chordType];
    var pitches = [root];

    for (var i = 0; i < intervals.length; i++) {
        pitches.push(notes.duplicatePitch(root).transpose(intervals[i]));
    }

    return new module.exports.Chord(pitches);
};
