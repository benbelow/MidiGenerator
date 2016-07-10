var notes = require('./notes.js');
var chords = require('./chords.js');
var random = require('./random.js');
var helpers = require('./helpers.js');

exports.Scale = function (steps, root) {
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

    this.tonic = function () {
        return _this.scalePitches[0];
    };
    this.supertonic = function () {
        return _this.scalePitches[1];
    };
    this.mediant = function () {
        return _this.scalePitches[2]
    };
    this.subdominant = function () {
        return _this.scalePitches[3]
    };
    this.dominant = function () {
        return _this.scalePitches[4];
    };
    this.submediant = function () {
        return _this.scalePitches[5];
    };
    this.leadingTone = function () {
        return _this.scalePitches[6];
    };

    this.tonicChord = function () {
        return new chords.Chord([_this.tonic(), _this.mediant(), _this.dominant()])
    };
    this.supertonicChord = function () {
        return new chords.Chord([_this.supertonic(), _this.subdominant(), _this.submediant()])
    };
    this.mediantChord = function () {
        return new chords.Chord([_this.mediant(), _this.dominant(), _this.leadingTone()])
    };
    this.subdominantChord = function () {
        return new chords.Chord([_this.subdominant(), _this.submediant(), _this.tonic().transpose(12)])
    };
    this.dominantChord = function () {
        return new chords.Chord([_this.dominant(), _this.leadingTone(), _this.supertonic().transpose(12)])
    };
    this.submediantChord = function () {
        return new chords.Chord([_this.submediant(), _this.tonic().transpose(12), _this.mediant().transpose(12)])
    };
    this.leadingToneChord = function () {
        return new chords.Chord([_this.leadingTone(), _this.supertonic().transpose(12), _this.subdominant().transpose(12)])
    };

    this.tonicSeventhChord = function () {
        return this.tonicChord().addPitch(this.leadingTone().transpose(12));
    };
    this.supertonicSeventhChord = function () {
        return this.supertonicChord().addPitch(this.tonic().transpose(12));
    };
    this.mediantSeventhChord = function () {
        return this.mediantChord().addPitch(this.supertonic().transpose(12));
    };
    this.subdominantSeventhChord = function () {
        return this.subdominantChord().addPitch(this.mediant().transpose(12));
    };
    this.dominantSeventhChord = function () {
        return this.dominantChord().addPitch(this.subdominant().transpose(12));
    };
    this.submediantSeventhChord = function () {
        return this.submediantChord().addPitch(this.dominant().transpose(12));
    };
    this.leadingToneSeventhChord = function () {
        return this.leadingToneChord().addPitch(this.submediant().transpose(12));
    };

    this.chords = function () {
        return [this.tonicChord(), this.supertonicChord(), this.mediantChord(), this.subdominantChord(), this.dominantChord(), this.submediantChord(), this.leadingToneChord()
            , this.tonicSeventhChord(), this.supertonicSeventhChord(), this.mediantSeventhChord(), this.subdominantSeventhChord(), this.dominantSeventhChord(), this.submediantSeventhChord(), this.leadingToneSeventhChord()];
    };

    this.getLength = function () {
        return this.scalePitches.length;
    };

    this.scaleNotes = function () {
        return this.scalePitches.map(function (x) {
            return x.note;
        })
    };

    this.getRandomPitch = function () {
        return random.getRandomElementOfArray(this.scalePitches);
    };

    this.getRandomChord = function () {
        return random.getRandomElementOfArray(_this.chords());
    };

    // ToDo: this is almost the same algorithm as note.transpose. Commonise?
    this.scaleTranspose = function (pitch, interval) {
        if (interval > 12) {
            return this.scaleTranspose(pitch, 12).scaleTranspose(pitch, interval - 12);
        }
        if (interval < -12) {
            return this.scaleTranspose(pitch, -12).scaleTranspose(pitch, interval + 12);
        }
        var scaleIndex = this.scaleNotes().indexOf(pitch.note);
        if (scaleIndex == -1) {
            throw("Asked for interval from note not in scale.");
        }
        var newPitch = notes.duplicatePitch(pitch);
        var newIndex = scaleIndex + interval;
        if (newIndex >= this.scaleNotes().length) {
            newIndex -= this.scaleNotes().length;
        }
        if (newIndex < 0) {
            newIndex += this.scaleNotes().length;
        }
        if (notes.NOTES.indexOf(this.scaleNotes()[newIndex]) < notes.NOTES.indexOf(pitch.note) && interval > 0) {
            newPitch.octave++;
        }
        if (notes.NOTES.indexOf(this.scaleNotes()[newIndex]) > notes.NOTES.indexOf(pitch.note) && interval < 0) {
            newPitch.octave--;
        }
        newPitch.note = this.scaleNotes()[newIndex];
        return newPitch;
    };

    this.getScaleInterval = function (pitch1, pitch2) {
        var pitch1Index = this.scaleNotes().indexOf(pitch1.note);
        var pitch2Index = this.scaleNotes().indexOf(pitch2.note);
        if (pitch1Index == -1 || pitch2Index == -1) {
            throw("Asked for interval from note not in scale.");
        }
        var pitchDifference = pitch2Index - pitch1Index;
        var absolutePitchInterval = pitch1.interval(pitch2);

        if (Math.abs(absolutePitchInterval) > 12) {
            throw("!");
        } else if (helpers.sign(absolutePitchInterval) != helpers.sign(pitchDifference)){
            pitchDifference = (this.scalePitches.length - Math.abs(pitchDifference)) * helpers.sign(absolutePitchInterval);
        }

        return pitchDifference;
    };

    this.scaleIntervals = function (pitches) {
        var intervals = [];
        if (pitches.length <= 1) {
            return intervals;
        }
        for (var i = 0; i < pitches.length - 1; i++) {
            intervals.push(this.getScaleInterval(pitches[i], pitches[i + 1]));
        }
        return intervals;
    };
};
