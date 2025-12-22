---
layout: default
title: Aubrie Lee - Training my senses using my phone
permalink: /training-my-senses
---

# Training my senses using my phone

2025.12.21
{: .centeredText .noIndent}

I've explored ways to make my phone enhance my understanding of my physical and temporal world. Two of these ways are by perfecting my pitch and gauging the passage of time.

## Perfecting my pitch
I watched a documentary called the Social Dilemma, which described how tech companies manipulate attention via notifications. I decided to be much more judicious about what I'd let my phone bother me about; I am now quick to turn off all notifications for apps that give me even a single unsolicited one.

Beyond that, I thought, how could I make notifications further work for my benefit? I realized I could use them to train my ear. For the notifications I do allow, such as messages from friends and family, I've set my default notification sound to middle C.

## Marking the time
I have my phone vibrate at the :00, :20, and :40 marks, so that I can calibrate my sense of duration and have an idea of what time it is even if I'm not looking at a clock.

If I'm looking at my computer and sense one of these time-based vibrations, I try to take a moment to look away from my screen. Sometimes, when I'm rushing to catch a bus or train, I'll feel my phone buzz in my purse and have a better sense of how much time I have without stopping to look at my watch.

In the past, I used MacroDroid to play a buzz from a list of presets, but after I had to [reset my phone](https://verse.aubrielee.com/@Aubrie/115504160660682936), MacroDroid no longer worked. I discovered that Automate by LlamaLabs not only allowed me to achieve what MacroDroid did, it also let me customize the buzz (and Automate is free without ads, unlike MacroDroid).

To play different vibration patterns every 20 minutes while the phone isn't plugged in, I use this flow:
1. Flow beginning
2. Await time  
Proceed = Exact  
Time of day = time(dateFormat(Now, "H"), dateFormat(Now, "m") - (dateFormat(Now, "m") % 20) + 20)
based on https://www.reddit.com/r/AutomateUser/comments/1mnohda/comment/n86j3r2/
4. Is power source plugged  
Proceed = Immediately  
    - Yes: loop back to #2  
    - No: Vibrate  
    Pattern = {"0": [0, 1000], "1": [0, 1000, 500, 1000], "2": [0, 1000, 500, 1000, 500, 1000]}[dateFormat(Now, "m") // 20]
with credit and many thanks to Henrik Lindqvist
then loop back to #2

Whenever I sense one of these time-based vibrations, I try to take a moment to look away from my screen, breathe, drink water, and appreciate the world around me. I call this practice "Rexist"—a reminder to reenter existence.
