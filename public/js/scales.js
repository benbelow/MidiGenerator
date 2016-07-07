var notes = require('./notes.js');
var random = require('./random.js');

exports.Scale = function(steps, root) {
    var _this = this;
    this.steps = steps;
    this.root = root;
    this.scaleNotes = [this.root];
    for (var i = 0; i < this.steps.length; i++) {
        var lastNote = this.scaleNotes.slice(-1)[0];
        var newNote = notes.duplicatePitch(lastNote);
        newNote = newNote.transpose(this.steps[i]);
        this.scaleNotes.push(newNote);
    }

    this.tonic = function(){
        return _this.scaleNotes[0];
    };
    this.supertonic = function(){
        return _this.scaleNotes[1];
    };
    this.mediant = function(){
        return _this.scaleNotes[2]
    };
    this.subdominant = function(){
        return _this.scaleNotes[3]
    };
    this.dominant = function(){
        return _this.scaleNotes[4];
    };
    this.submediant = function(){
        return _this.scaleNotes[5];
    };
    this.leadingTone = function(){
        return _this.scaleNotes[6];
    };

    this.tonicChord = function(){
        return [_this.tonic(),_this.mediant(),_this.dominant()]
    };
    this.supertonicChord = function(){
        return [_this.supertonic(),_this.subdominant(),_this.submediant()]
    };
    this.mediantChord = function(){
        return [_this.mediant(),_this.dominant(),_this.leadingTone()]
    };
    this.subdominantChord = function(){
        return [_this.subdominant(),_this.submediant(),_this.tonic().transpose(12)]
    };
    this.dominantChord = function(){
        return [_this.dominant(),_this.leadingTone(),_this.supertonic().transpose(12)]
    };
    this.submediantChord = function(){
        return [_this.submediant(),_this.tonic().transpose(12),_this.mediant().transpose(12)]
    };
    this.leadingToneChord = function(){
        return [_this.leadingTone(),_this.supertonic().transpose(12),_this.subdominant().transpose(12)]
    };

    this.getLength = function () {
        return this.scaleNotes.length;
    };

    this.getRandomNote = function () {
        return random.getRandomElementOfArray(this.scaleNotes);
    };
}