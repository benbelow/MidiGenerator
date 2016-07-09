var scales = require('./scales.js');
var MidiWriter = require('midi-writer-js');
var chords = require('./chords.js');
var notes = require('./notes.js');
var random = require('./random.js');
var helpers = require('./helpers.js');

var NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
var DURATIONS = ["1", "2", "d2", "4", "d4", "8", "8t", "d8", "16"];
var durationsInTwelfthBeats = {"1": 48, "2": 24, "d2": 36, "4": 12, "d4": 18, "8": 6, "8t": 4, "d8": 9, "16": 3};
var weightedDurations = {"1": 5, "2": 10, "d2": 6, "4": 20, "d4": 6, "8": 8, "8t": 9, "d8": 2, "16": 15};
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

    var sequence = new chords.generateSequence(scale, 2);
    var chorusSequence = new chords.generateSequence(scale, 4);

    var verse = generateSection(4, sequence);
    var chorus = generateSection(2, chorusSequence);
    playSection(verse);
    playSection(verse);
    playSection(chorus);
    playSection(verse);


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
        for (var i = 0; i < durations.length; i++) {
            pitch = undefined;
            if (i == 0) {
                pitch = chord.root;
            } else if (i > 1) {
                var lastInterval = scale.getInterval(helpers.lastItemInList(pitches), helpers.penultimateItemInList(pitches));
                if (0 < lastInterval && lastInterval < 2 && random.check(50)) {
                    pitch = scale.getPitchAtInterval(helpers.lastItemInList(pitches), random.getRandomNumberInRange(1, 3));
                } else if (-2 < lastInterval && lastInterval < 0 && random.check(50)) {
                    pitch = scale.getPitchAtInterval(helpers.lastItemInList(pitches), -random.getRandomNumberInRange(1, 3));
                } else if (lastInterval > 3) {
                    pitch = scale.getPitchAtInterval(helpers.lastItemInList(pitches), random.getRandomNumberInRange(1, 3));
                } else if (lastInterval < -3) {
                    pitch = scale.getPitchAtInterval(helpers.lastItemInList(pitches), -random.getRandomNumberInRange(1, 3));
                }
            }
            if (pitch == undefined) {
                pitch = scale.getRandomPitch();

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
        var newDurations = phrase.durations;
        var newPitches = phrase.pitches;
        if (random.check(0)) {
            newDurations = generatePhraseDurations(phrase.numberOfBeats);
            if (newDurations.length > phrase.pitches.length) {
                newPitches = newPitches.concat(generatePitchesForPhraseDurations(newDurations.slice(0, phrase.pitches.length - newDurations.length), phrase.chord));
            } else {
                newPitches = newPitches.slice(0, newDurations.length);
            }
        } else {
            var numberOfPitchesToChange = random.getRandomNumberInRange(1, newPitches.length);
            var changedIndexes = [];
            for (var i = 0; i < numberOfPitchesToChange; i++) {
                var indexToChange;
                do {
                    indexToChange = random.getRandomNumberInRange(0, newPitches.length - 1);
                } while (changedIndexes.indexOf(indexToChange) != -1)
                newPitches[indexToChange] = scale.getPitchAtInterval(newPitches[indexToChange], random.getRandomNumberInRange(-2,2));
                changedIndexes.push(indexToChange);
            }
            newPitches = generatePitchesForPhraseDurations(newDurations, phrase.chord);
        }
        return {
            durations: newDurations,
            pitches: newPitches,
            chord: phrase.chord,
            numberOfBeats: phrase.numberOfBeats
        };
    }

    function generateSection(beatsPerPhrase, sequence) {
        var phrases = [];
        for (var i = 0; i < sequence.length; i++) {
            if (i == 1 && random.check(100)) {
                phrases.push(variationOfPhrase(phrases[0]));
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
            if (i == 0) {
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

