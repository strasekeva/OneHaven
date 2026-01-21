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

## GitHub Code Scanning
V repozitoriju je bil omogočen GitHub Code Scanning. Po izvedenem varnostnem skeniranju na glavnem branchu niso bile zaznane nobene varnostne ranljivosti. Rezultati potrjujejo, da trenutna koda ne vsebuje znanih varnostnih težav, GitHub pa bo tudi v prihodnje samodejno spremljal morebitne nove ranljivosti.
<img width="1406" height="838" alt="image" src="https://github.com/user-attachments/assets/fabd00d6-73b7-4459-95c2-7302b519dabe" />

## Snyk
Snyk analiza Docker image-a je pokazala več varnostnih ranljivosti, ki večinoma izvirajo iz posrednih odvisnosti. Kljub manjšim izboljšavam Dockerfile-a se stanje bistveno ni spremenilo, saj projekt nima neposrednega vpliva na te odvisnosti.
<img width="1140" height="321" alt="image" src="https://github.com/user-attachments/assets/01faad80-af01-40cb-a6b4-d52c4f63a8a0" />
<img width="258" height="180" alt="image" src="https://github.com/user-attachments/assets/2314f8c0-e62d-4d2c-bd23-d0acfc28551a" />

<img width="1143" height="324" alt="image" src="https://github.com/user-attachments/assets/99a56155-1338-467a-9c92-5f3baaf8b7c5" />
<img width="382" height="265" alt="image" src="https://github.com/user-attachments/assets/8b48fffa-3dda-44e9-becd-5df57f15e83c" />


