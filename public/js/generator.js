var scales = require('./scales.js');
var MidiWriter = require('midi-writer-js');
var chords = require('./chords.js');
var notes = require('./notes.js');
var random = require('./random.js');
var helpers = require('./helpers.js');

var NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
var DURATIONS = ["1", "2", "d2", "4", "d4", "8", "8t", "d8", "16"];
var durationsInTwelfthBeats = {"1": 48, "2": 24, "d2": 36, "4": 12, "d4": 18, "8": 6, "8t": 4, "d8": 9, "16": 3};
var weightedDurations = {"1": 2, "2": 12, "d2": 6, "4": 22, "d4": 12, "8": 15, "8t": 9, "d8": 3, "16": 10};
var ionianSteps = [2, 2, 1, 2, 2, 2];
var dorianSteps = [2, 1, 2, 2, 2, 1];
var phrygianSteps = [1, 2, 2, 2, 1, 2];
var lydianSteps = [2, 2, 2, 1, 2, 2];
var mixolydianSteps = [2, 2, 1, 2, 2, 1];
var aeolianSteps = [2, 1, 2, 2, 1, 2];
var locrianSteps = [1, 2, 2, 1, 2, 2];
modes = {
    "Ionian": ionianSteps,
    "Dorian": dorianSteps,
    "Phrygian": phrygianSteps,
    "Lydian": lydianSteps,
    "Mixolydian": mixolydianSteps,
    "Aeolian": aeolianSteps,
    "Locrian": locrianSteps
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
function midiRest(duration) {
    return new MidiWriter.NoteEvent({
        pitch: ["C1"], duration: "0", wait: duration, sequential: false
    });
}

exports.generateMelody = function generateMelody() {
    var track = new MidiWriter.Track();
    track.setTempo(120);

    var root = new notes.Pitch(random.getRandomElementOfArray(NOTES), 3);
    var mode = random.getRandomElementOfArray(Object.keys(modes).map(function (x) {
        return modes[x]
    }));
    var scale = new scales.Scale(mode, root);

    var sequence = new chords.generateSequence(scale, random.getRandomElementOfArray([2, 4, 8]));
    var chorusSequence = new chords.generateSequence(scale, random.getRandomElementOfArray([2, 4]));

    var chorus = generateSection(random.getRandomElementOfArray([2, 3, 4]), chorusSequence);

    playSection(generateSection(random.getRandomElementOfArray([2, 3, 4, 5, 6, 7, 8]), sequence));
    playSection(chorus);
    playSection(chorus);
    playSection(generateSection(random.getRandomElementOfArray([2, 3, 4, 5, 6, 7, 8]), sequence));
    playSection(chorus);
    playSection(chorus);
    playSection(generateSection(random.getRandomElementOfArray([2, 3, 4, 5, 6, 7, 8]), sequence));
    playSection(chorus);



    track.addEvent(midiChord(scale.tonicChord().chordNotes(), "1"));

    console.log(root.note + " " + Object.keys(modes).filter(function (x) {
            return modes[x] == mode
        }));

    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

    var write = new MidiWriter.Writer([track]);
    return 'data:audio/midi;base64,' + write.base64();

    function generatePhraseDurations(numberOfBeats) {
        var numberOfTwelfthBeats = numberOfBeats * 12;
        var durations = [];
        var sumOfDurations = 0;
        while (sumOfDurations < numberOfTwelfthBeats) {
            if (numberOfTwelfthBeats - sumOfDurations == 5 || numberOfTwelfthBeats - sumOfDurations < 3) {
                //Gone wrong, start again. There's probably a better algorithm than this, but hey it's really late, ok.
                return generatePhraseDurations(numberOfBeats);
            }
            var durationToAdd = getRandomWeightedDuration();
            var durationToAddInFortyEighths = durationsInTwelfthBeats[durationToAdd];
            if (durations.length == 0) {
                var allowedDurations = ["2", "4"];
                durationToAdd = random.getRandomElementOfArray(allowedDurations);
                durationToAddInFortyEighths = durationsInTwelfthBeats[durationToAdd];
            }
            while (numberOfTwelfthBeats - sumOfDurations < durationToAddInFortyEighths) {
                durationToAdd = getRandomWeightedDuration();
                durationToAddInFortyEighths = durationsInTwelfthBeats[durationToAdd];
            }
            if (durationToAdd == "8t" && durationToAddInFortyEighths - (durationToAddInFortyEighths * 3) >= 0) {
                durations.push(durationToAdd);
                durations.push(durationToAdd);
                sumOfDurations += durationToAddInFortyEighths;
                sumOfDurations += durationToAddInFortyEighths;
            }
            durations.push(durationToAdd);
            sumOfDurations += durationToAddInFortyEighths;
        }
        return durations;
    }

    function generatePitchesForPhraseDurations(durations, chord) {
        var pitches = [];
        var pitch;
        var maxDeviation = 10;
        for (var i = 0; i < durations.length; i++) {
            pitch = undefined;
            if (i == 0) {
                pitch = random.getRandomElementOfArray(chord.chordNotes());
            } else if (i > 1) {
                var lastInterval = helpers.lastItemInList(scale.scaleIntervals(pitches));
                if (0 < lastInterval && lastInterval < 3 && random.check(55)) {
                    pitch = random.check(75) ? scale.scaleTranspose(helpers.lastItemInList(pitches), random.getRandomNumberInRange(1, 2))
                        : scale.scaleTranspose(helpers.lastItemInList(pitches), -random.getRandomNumberInRange(1, 2));
                } else if (-3 < lastInterval && lastInterval < 0 && random.check(55)) {
                    pitch = random.check(75) ? scale.scaleTranspose(helpers.lastItemInList(pitches), -random.getRandomNumberInRange(1, 2))
                        : scale.scaleTranspose(helpers.lastItemInList(pitches), random.getRandomNumberInRange(1, 2));
                } else if (lastInterval > 3 && random.check(80)) {
                    pitch = scale.scaleTranspose(helpers.lastItemInList(pitches), random.getRandomNumberInRange(1, 3));
                } else if (lastInterval < -3 && random.check(80)) {
                    pitch = scale.scaleTranspose(helpers.lastItemInList(pitches), -random.getRandomNumberInRange(1, 3));
                }
            }
            if (pitch == undefined) {
                var jumpRange = 6;
                if (scale.scaleIntervals(pitches).some(function (x) {
                        return Math.abs(x) > 5
                    })) {
                    jumpRange = 4;
                } else if(random.check(60)){
                    jumpRange = 3;
                }
                pitch = scale.scaleTranspose(helpers.lastItemInList(pitches), random.getRandomNumberInRange(-jumpRange, jumpRange));
            }
            var deviationFromRoot = scale.getScaleInterval(scale.root, pitch);
            if (Math.abs(deviationFromRoot) > maxDeviation) {
                var minimumFix = Math.abs(deviationFromRoot) - maxDeviation;
                var maximumFix = Math.abs(deviationFromRoot) + maxDeviation;
                var toTranspose = random.getRandomNumberInRange(minimumFix, maximumFix) * -helpers.sign(deviationFromRoot);
                pitch = scale.scaleTranspose(pitch, toTranspose);
            }
            pitches.push(pitch);
        }
        return pitches;
    }

    function generatePhrase(numberOfBeats, chord) {
        var durations = generatePhraseDurations(numberOfBeats);
        var pitches = generatePitchesForPhraseDurations(durations, chord);
        return {durations: durations, pitches: pitches, chord: chord, numberOfBeats: numberOfBeats};
    }

    function variationOfPhrase(phrase) {
        var newPhrase;
        if (random.check(20)) {
            newPhrase = varyPhraseDurations(phrase);
        } else {
            newPhrase = varyPhrasePitches(phrase);
        }
        if (random.check(75)) {
            newPhrase = varyPhraseChord(newPhrase);
        }
        return newPhrase;
    }

    function varyPhraseDurations(phrase) {
        var newDurations = generatePhraseDurations(phrase.numberOfBeats);
        var newPitches = phrase.pitches.slice();
        if (newDurations.length > phrase.pitches.length) {
            newPitches = newPitches.concat(generatePitchesForPhraseDurations(newDurations.slice(0, newDurations.length - phrase.pitches.length), phrase.chord));
        } else {
            newPitches = newPitches.slice(0, newDurations.length);
        }
        return {
            durations: newDurations,
            pitches: newPitches,
            chord: phrase.chord,
            numberOfBeats: phrase.numberOfBeats
        };
    }

    function varyPhrasePitches(phrase) {
        var newPitches = phrase.pitches.slice();
        var numberOfPitchesToChange = random.getRandomNumberInRange(1, newPitches.length);
        var changedIndexes = [];
        for (var i = 0; i < numberOfPitchesToChange; i++) {
            var indexToChange;
            do {
                indexToChange = random.getRandomNumberInRange(0, newPitches.length - 1);
            } while (changedIndexes.indexOf(indexToChange) != -1);
            newPitches[indexToChange] = scale.scaleTranspose(newPitches[indexToChange], random.getRandomNumberInRange(-2, 2));
            changedIndexes.push(indexToChange);
        }
        return {
            durations: phrase.durations,
            pitches: newPitches,
            chord: phrase.chord,
            numberOfBeats: phrase.numberOfBeats
        };
    }

    function varyPhraseChord(phrase) {
        return {
            durations: phrase.durations,
            pitches: phrase.pitches,
            chord: scale.getRandomChord(),
            numberOfBeats: phrase.numberOfBeats
        };
    }

    function generateSection(beatsPerPhrase, sequence) {
        var phrases = [];

        var ABABSection = random.check(85) && sequence.length >= 4;

        function generateABABSection(beatsPerPhrase, sequence) {
            var phrases = [];
            for (var i = 0; i < sequence.length; i++) {
                if (i == 2) {
                    phrases.push(phrases[0]);
                } else if (i == 3){
                    phrases.push(variationOfPhrase(phrases[1]));
                } else {
                    phrases.push(generatePhrase(beatsPerPhrase, sequence[i]));
                }
            }
            return phrases;
        }

        if(ABABSection){
            phrases = generateABABSection(beatsPerPhrase, sequence);
        }

        for (var i = 0; i < sequence.length; i++) {
            if (i == 1 && random.check(75)) {
                phrases.push(variationOfPhrase(phrases[0]));
            } else if (i > 1 && random.check(15)) {
                phrases.push(variationOfPhrase(random.getRandomElementOfArray(phrases)));
            } else {
                phrases.push(generatePhrase(beatsPerPhrase, sequence[i]));
            }
        }
        return phrases;
    }

    function playSection(section) {
        for (var i = 0; i < section.length; i++) {
            playPhrase(section[i]);
        }
    }

    function playPhrase(phrase) {
        for (var i = 0; i < phrase.durations.length; i++) {
            if (i == 0 && random.check(100)) {
                track.addEvent(midiChord(phrase.chord.chordNotes(), phrase.durations[i]));
            } else {
                track.addEvent(midiNote(phrase.pitches[i], phrase.durations[i]));
            }
        }
    }

    function sumOfDurationWeights() {
        var weightedDurationValues = Object.keys(weightedDurations);
        var totalWeight = 0;
        for (var i in weightedDurationValues) {
            totalWeight += weightedDurations[weightedDurationValues[i]];
        }
        return totalWeight;
    }

    function getRandomWeightedDuration() {
        var weightedDurationValues = Object.keys(weightedDurations);
        var sumOfWeights = sumOfDurationWeights();
        var randomWeight = random.getRandomNumberInRange(0, sumOfWeights);
        var currentTotal = 0;
        for (var i = 0; i < weightedDurationValues.length; i++) {
            currentTotal += weightedDurations[weightedDurationValues[i]];
            if (randomWeight <= currentTotal) {
                return weightedDurationValues[i];
            }
        }
    }


};

