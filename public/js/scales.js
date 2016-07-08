var notes = require('./notes.js');
var chords = require('./chords.js');
var random = require('./random.js');
var helpers = require('./helpers.js');

exports.Scale = function(steps, root) {
    var _this = this;
    this.steps = steps;
    this.root = root;
    this.scalePitches = [this.root];
    for (var i = 0; i < this.steps.length; i++) {
        var lastNote = helpers.lastItemInList(this.scalePitches);
        var newNote = notes.duplicatePitch(lastNote);
        newNote = newNote.transpose(this.steps[i]);
        this.scalePitches.push(newNote);
    }

    this.tonic = function(){
        return _this.scalePitches[0];
    };
    this.supertonic = function(){
        return _this.scalePitches[1];
    };
    this.mediant = function(){
        return _this.scalePitches[2]
    };
    this.subdominant = function(){
        return _this.scalePitches[3]
    };
    this.dominant = function(){
        return _this.scalePitches[4];
    };
    this.submediant = function(){
        return _this.scalePitches[5];
    };
    this.leadingTone = function(){
        return _this.scalePitches[6];
    };

    this.tonicChord = function(){
        return new chords.Chord([_this.tonic(),_this.mediant(),_this.dominant()])
    };
    this.supertonicChord = function(){
        return new chords.Chord([_this.supertonic(),_this.subdominant(),_this.submediant()])
    };
    this.mediantChord = function(){
        return new chords.Chord([_this.mediant(),_this.dominant(),_this.leadingTone()])
    };
    this.subdominantChord = function(){
        return new chords.Chord([_this.subdominant(),_this.submediant(),_this.tonic().transpose(12)])
    };
    this.dominantChord = function(){
        return new chords.Chord([_this.dominant(),_this.leadingTone(),_this.supertonic().transpose(12)])
    };
    this.submediantChord = function(){
        return new chords.Chord([_this.submediant(),_this.tonic().transpose(12),_this.mediant().transpose(12)])
    };
    this.leadingToneChord = function(){
        return new chords.Chord([_this.leadingTone(),_this.supertonic().transpose(12),_this.subdominant().transpose(12)])
    };
    
    this.tonicSeventhChord = function(){
        return this.tonicChord().addPitch(this.leadingTone().transpose(12));
    };
    this.supertonicSeventhChord = function(){
        return this.supertonicChord().addPitch(this.tonic().transpose(12));
    };
    this.mediantSeventhChord = function(){
        return this.mediantChord().addPitch(this.supertonic().transpose(12));
    };
    this.subdominantSeventhChord = function(){
        return this.subdominantChord().addPitch(this.mediant().transpose(12));
    };
    this.dominantSeventhChord = function(){
        return this.dominantChord().addPitch(this.subdominant().transpose(12));
    };
    this.submediantSeventhChord = function(){
        return this.submediantChord().addPitch(this.dominant().transpose(12));
    };
    this.leadingToneSeventhChord = function(){
        return this.leadingToneChord().addPitch(this.submediant().transpose(12));
    };

    this.chords = function(){
        return [this.tonicChord(), this.supertonicChord(), this.mediantChord(), this.subdominantChord(), this.dominantChord(), this.submediantChord(), this.leadingToneChord()
        ,this.tonicSeventhChord(), this.supertonicSeventhChord(), this.mediantSeventhChord(), this.subdominantSeventhChord(), this.dominantSeventhChord(), this.submediantSeventhChord(), this.leadingToneSeventhChord()];
    };

    this.getLength = function () {
        return this.scalePitches.length;
    };

    this.scaleNotes = function(){
        return this.scalePitches.map(function(x){return x.note;})
    };

    this.getRandomNote = function () {
        return random.getRandomElementOfArray(this.scalePitches);
    };

    this.getRandomChord = function() {
        return random.getRandomElementOfArray(_this.chords());
    }
};