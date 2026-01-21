## Datadog
Za spremljanje CI/CD procesa sem uporabil Datadog, ki sem ga povezal z GitHub repozitorijem projekta OneHaven. 

<img width="1183" height="364" alt="image" src="https://github.com/user-attachments/assets/a870303b-0abd-4656-8868-bc2481c306c0" />


Na nadzorni plošči so prikazane osnovne CI metrike, kot so:
	•	število CI pipeline izvajanj,
	•	razporeditev pipeline-ov po branchih,
	•	uspešnost izvajanj (uspešni/neuspešni),
	•	najpogosteje izvajani CI jobi,
	•	neuspešni pipeline-i skozi čas.

<img width="781" height="179" alt="image" src="https://github.com/user-attachments/assets/ecdb472d-0ce1-4215-9e0a-e9b182dcdbae" />

<img width="387" height="347" alt="image" src="https://github.com/user-attachments/assets/d0f5c139-686d-45b8-9b13-6bd782bea7f8" />


Iz podatkov je razvidno, da se CI pipeline pogosto sproži ob več zaporednih commitih, predvsem na branchu main. Večina izvajanj se zaključi uspešno, napake pa so redke.

Na podlagi analize sem dodal concurrency v GitHub Actions, ki prekliče stare pipeline rune za isti branch. S tem se zmanjša število nepotrebnih izvajanj in izboljša učinkovitost CI procesa.

<img width="391" height="171" alt="image" src="https://github.com/user-attachments/assets/e5843ce2-176f-4b47-89df-539da8c6376b" />

Prikazani so CI jobi, ki se izvajajo najpogosteje. Največ izvajanj imajo testi, build in deploy koraki, kar kaže na to, da ti deli predstavljajo glavni del CI pipeline-a.
Ker se ti jobi izvajajo ob vsakem zagonu pipeline-a, je smiselna optimizacija predvsem v zmanjševanju števila nepotrebnih izvajanj, kar je bilo doseženo z uporabo mehanizma concurrency.
<img width="648" height="572" alt="image" src="https://github.com/user-attachments/assets/09ac9f9e-46b3-4098-84d9-f76c5bd949d7" />

