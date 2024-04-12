CREATE TABLE products (
    id serial NOT NULL,
    name character varying(255) PRIMARY KEY,
    brand character varying(255),
    image character varying(255),
    max_reach real NOT NULL,
    max_speed real NOT NULL,
    price_per_hour money NOT NULL,
    description_html text NOT NULL
);

CREATE TABLE scooters (
    id serial NOT NULL PRIMARY KEY,
    product character varying(255) NOT NULL REFERENCES public.products (name),
    battery real NOT NULL,
    coordinates_lat real NOT NULL,
    coordinates_lng real NOT NULL
);


INSERT INTO Products (name, brand, image, max_reach, max_speed, price_per_hour, description_html)
VALUES
('Nimbus 2000','Nimbus','Nimbus 2000.jpg', 171.72, 37.6, 8.82,
'
<h1>Nimbus 2000 E-Scooter</h1>
<p>Entdecken Sie den <strong>Nimbus 2000</strong>, den E-Scooter, der Tradition und Moderne meisterhaft vereint. Mit seinem eleganten, hölzernen Design bietet der Nimbus 2000 eine einzigartige Kombination aus Ästhetik und Funktionalität, die ihn von anderen Scootern abhebt.</p>

<h2>Einzigartiges Design</h2>
<p>Der Nimbus 2000 hebt sich mit seinem schicken, hölzernen Rahmen hervor, der nicht nur für ein atemberaubendes Erscheinungsbild sorgt, sondern auch Nachhaltigkeit und Langlebigkeit verspricht. Jedes Detail wurde sorgfältig verarbeitet, um eine perfekte Mischung aus natürlicher Schönheit und moderner Technologie zu bieten.</p>

<h2>Leichte Handhabung</h2>
<p>Mit seinem intuitiven Klappmechanismus lässt sich der Nimbus 2000 leicht transportieren und verstauen, was ihn zum idealen Begleiter für das urbane Abenteuer macht. Trotz seines robusten, hölzernen Designs ist er überraschend leicht und gewährleistet so eine mühelose Handhabung.</p>

<h2>Umweltbewusst Mobil</h2>
<p>Der Nimbus 2000 steht nicht nur für Stil, sondern auch für umweltfreundliche Mobilität. Durch die Nutzung nachhaltiger Materialien und elektrischer Antriebe trägt er dazu bei, die Umweltbelastung zu reduzieren und fördert einen bewussteren Umgang mit Fortbewegungsmitteln.</p>

<h2>Integrierte Sicherheitsfeatures</h2>
<p>Sicherheit steht beim Nimbus 2000 an erster Stelle. Ausgestattet mit hochwertigen Bremsen und reflektierenden Elementen, bietet dieser E-Scooter nicht nur stilvolle, sondern auch sichere Fahrten durch die Stadt.</p>

<p>Wählen Sie den <strong>Nimbus 2000</strong> für eine außergewöhnliche Fahrerfahrung, die Design, Nachhaltigkeit und Sicherheit in einem revolutionären E-Scooter vereint.</p>
'),


('Nimbus 2000+','Nimbus','Nimbus 2000+.jpg', 215.8, 30, 8.03,
'
<h1>Nimbus 2000+ E-Scooter</h1>
<p>Erleben Sie den <strong>Nimbus 2000+</strong>, die neueste Innovation im Bereich urbaner Mobilität, die eine perfekte Symbiose aus traditioneller Handwerkskunst und fortschrittlicher Technologie darstellt. Mit seinem exquisiten, hölzernen Design und verbesserten Funktionen setzt der Nimbus 2000+ neue Maßstäbe für ästhetisches Design und Fahrkomfort.</p>

<h2>Exquisites Hölzernes Design</h2>
<p>Der Nimbus 2000+ besticht durch seinen eleganten Rahmen aus ausgewähltem, nachhaltig bezogenem Holz, das jedem Scooter einen einzigartigen Charakter verleiht. Die Verbindung aus natürlicher Wärme und zeitgemäßer Eleganz macht diesen E-Scooter zu einem wahren Kunstwerk der Mobilität.</p>

<h2>Verbesserte Handhabung</h2>
<p>Dank seines fortschrittlichen Klappmechanismus ist der Nimbus 2000+ nicht nur leicht zu transportieren und zu verstauen, sondern auch stabiler und sicherer im täglichen Gebrauch. Seine ausgewogene Konstruktion gewährleistet eine unübertroffene Handhabung und ein reibungsloses Fahrerlebnis.</p>

<h2>Nachhaltige und Effiziente Mobilität</h2>
<p>Der Nimbus 2000+ verbindet Design mit Nachhaltigkeit. Durch die Verwendung von umweltfreundlichen Materialien und dem neuesten Stand der Elektromotorentechnologie leistet dieser E-Scooter einen wichtigen Beitrag zum Umweltschutz und bietet eine effiziente, emissionsfreie Alternative für urbane Fortbewegung.</p>

<h2>Erweiterte Sicherheitsmerkmale</h2>
<p>Der Nimbus 2000+ geht keine Kompromisse bei der Sicherheit ein. Mit verbesserten Bremssystemen, heller LED-Beleuchtung und integrierten Sicherheitsreflektoren sorgt er für optimale Sichtbarkeit und Sicherheit, selbst bei schlechten Lichtverhältnissen.</p>

<h2>Zusätzliche Funktionen</h2>
<p>Abgerundet wird das Profil des Nimbus 2000+ durch smarte Technologien wie GPS-Tracking, Diebstahlschutz und eine intuitive App-Steuerung, die es ermöglichen, den Scooter zu lokalisieren, zu sperren und individuelle Fahrprofile einzustellen.</p>

<p>Wählen Sie den <strong>Nimbus 2000+</strong> für eine fortschrittliche, sichere und stilvolle Art, sich in der Stadt zu bewegen. Entdecken Sie, wie er traditionelle Werte mit modernster Technik für ein unvergleichliches Fahrerlebnis verbindet.</p>
'),


('Nimbus 2000++', 'Nimbus', 'Nimbus 2000++.jpg', 242.22, 37.5, 9.15,
'
<h1>Nimbus 2000++ E-Scooter</h1>
<p>Der <strong>Nimbus 2000++</strong> setzt neue Standards im urbanen Fortbewegungsbereich und vereint erlesene Handwerkskunst mit Spitzentechnologie. Als Flaggschiff unserer E-Scooter-Reihe verkörpert der Nimbus 2000++ eine unvergleichliche Mischung aus Design, Leistung und Nachhaltigkeit.</p>

<h2>Hochwertiges, Hölzernes Design</h2>
<p>Mit seinem Rahmen aus erstklassigem, umweltfreundlichem Holz, veredelt durch handwerkliche Meisterschaft, bietet der Nimbus 2000++ eine ästhetische und haptische Erfahrung, die seinesgleichen sucht. Jedes Exemplar ist ein Unikat, das natürliche Schönheit mit moderner Funktionalität verbindet.</p>

<h2>Optimierte Handhabung & Komfort</h2>
<p>Der Nimbus 2000++ zeichnet sich durch einen hochentwickelten, benutzerfreundlichen Klappmechanismus aus, der Stabilität und Sicherheit auf ein neues Niveau hebt. Ergonomisch gestaltete Griffe und eine angepasste Fahrfläche bieten maximalen Komfort und Kontrolle bei jeder Fahrt.</p>

<h2>Engagement für Nachhaltigkeit</h2>
<p>Als Pionier der ökologischen Urbanität integriert der Nimbus 2000++ die effizientesten Elektromotoren und nutzt ausschließlich erneuerbare Energien. Durch sein Engagement für eine grüne Zukunft setzt er ein starkes Zeichen für umweltbewusste Mobilität.</p>

<h2>Revolutionäre Sicherheitsausstattung</h2>
<p>Der Nimbus 2000++ definiert Sicherheit neu mit einem fortschrittlichen Bremssystem, das sofortiges Anhalten ermöglicht, und einer adaptiven LED-Beleuchtung, die sich den Umgebungslichtverhältnissen anpasst und so für optimale Sicht sorgt.</p>

<h2>Smart-Connect-Funktionalität</h2>
<p>Mit integriertem WLAN, GPS-Tracking und einer fortschrittlichen App-Anbindung bietet der Nimbus 2000++ eine nie dagewesene Kontrolle und Konnektivität. Von Diebstahlschutz bis hin zu individuellen Fahrmodi – erleben Sie smarte Mobilität auf höchstem Niveau.</p>

<p>Der <strong>Nimbus 2000++</strong> ist mehr als nur ein E-Scooter; er ist ein Versprechen für die Zukunft der Mobilität. Entdecken Sie jetzt, wie er Design, Technologie und Verantwortungsbewusstsein zu einem unvergesslichen Fahrerlebnis vereint.</p>
'),


('Infiniroll X Master', 'Infiniroll', 'Infiniroll X Master.jpg', 339.84, 34.9, 12.31,
'
<h1>Infiniroll X Master E-Scooter</h1>
<p>Der <strong>Infiniroll X Master</strong> ist nicht nur ein E-Scooter – er ist eine Revolution auf zwei Rädern. Mit seiner bahnbrechenden Technologie und einem Versprechen von Mobilität "bis zur Unendlichkeit und darüber hinaus!" setzt der Infiniroll X Master neue Maßstäbe für urbane Fortbewegung.</p>

<h2>Unbegrenzte Möglichkeiten</h2>
<p>Warum sich mit weniger zufriedengeben, wenn Sie mehr haben können? Der Infiniroll X Master bricht alle Grenzen der Mobilität und bietet eine Reichweite, die Ihre Erwartungen übertrifft – ein treuer Gefährte für jedes Abenteuer, das vor Ihnen liegt.</p>

<h2>Robustes Design</h2>
<p>Jedes Element des Infiniroll X Master wurde mit Blick auf Langlebigkeit und Widerstandsfähigkeit konzipiert. Sein robustes Gehäuse schützt vor den Elementen, während sein stilvolles Design sicherstellt, dass Sie überall im Rampenlicht stehen.</p>

<h2>Nahtlose Integration</h2>
<p>Erleben Sie die Zukunft der Mobilität mit einer nahtlosen Integration in Ihr digitales Leben. Der Infiniroll X Master kommt mit einer intuitiven App, die es ermöglicht, Ihr Fahrerlebnis zu personalisieren, Fahrdaten zu verfolgen und sogar den Scooter mit einem Klick zu sichern.</p>

<h2>Umweltfreundlich</h2>
<p>Der Infiniroll X Master setzt auf umweltfreundliche Technologie, um unseren Planeten zu schützen. Sein effizienter Elektroantrieb reduziert die CO2-Emissionen und unterstützt eine saubere, grüne Fortbewegung.</p>

<h2>Ultimativer Komfort</h2>
<p>Maximaler Komfort wird beim Infiniroll X Master großgeschrieben. Mit seiner ergonomischen Bauweise und anpassbaren Fahrmodi sorgt er für ein angenehmes Fahrerlebnis, egal wie lang die Reise dauert.</p>

<p>Steigen Sie auf den <strong>Infiniroll X Master</strong> um und erleben Sie, was es bedeutet, wenn Grenzen verschwinden. Dieser E-Scooter ist nicht nur ein Fortbewegungsmittel, er ist ein Tor zu neuen Horizonten und unbegrenzten Abenteuern.</p>
'),


('Infiniroll X Pro', 'Infiniroll', 'Infiniroll X Pro.jpg', 76.8, 20, 10.33,
'
<h1>Infiniroll X Pro E-Scooter</h1>
<p>Entdecken Sie mit dem <strong>Infiniroll X Pro</strong> die nächste Generation der urbanen Mobilität. Als Weiterentwicklung unseres revolutionären Modells bietet der Infiniroll X Pro eine noch beeindruckendere Reichweite, die das Motto "bis zur Unendlichkeit und darüber hinaus!" auf ein neues Level bringt.</p>

<h2>Grenzenlose Freiheit</h2>
<p>Der Infiniroll X Pro überwindet nicht nur Distanzen, sondern auch Erwartungen. Mit seiner erweiterten Mobilitätslösung sind Sie nie davon entfernt, wo Sie sein möchten – sei es der tägliche Pendelverkehr oder die Erkundung neuer Orte.</p>

<h2>Fortgeschrittenes Design</h2>
<p>Das Design des Infiniroll X Pro vereint Ästhetik mit Funktionalität. Sein schlankes, aber robustes Gehäuse ist nicht nur ein Blickfang, sondern auch gebaut, um den Herausforderungen urbaner Fortbewegung zu trotzen.</p>

<h2>Smart & Vernetzt</h2>
<p>Mit dem Infiniroll X Pro sind Sie immer einen Schritt voraus. Dank der erweiterten App-Kompatibilität können Sie Ihren Scooter personalisieren, Routen optimieren und Ihre Fahrdaten in Echtzeit überwachen – alles von Ihrem Smartphone aus.</p>

<h2>Verpflichtung zur Umwelt</h2>
<p>Wir glauben, dass Mobilität nicht auf Kosten der Umwelt gehen sollte. Der Infiniroll X Pro nutzt die neueste Elektromotorentechnologie, um eine effiziente und emissionsfreie Fortbewegung zu gewährleisten.</p>

<h2>Erhöhter Fahrkomfort</h2>
<p>Der Infiniroll X Pro setzt neue Maßstäbe in puncto Komfort. Mit verbesserten Dämpfungssystemen und einer ergonomischen Steuerung ist jede Fahrt so angenehm und reibungslos wie möglich.</p>

<p>Mit dem <strong>Infiniroll X Pro</strong> eröffnen sich Ihnen unbegrenzte Möglichkeiten. Dieser E-Scooter repräsentiert nicht nur die Spitze der technologischen Entwicklung, sondern auch ein Versprechen für eine fortschrittliche, nachhaltige und komfortable Form der Mobilität.</p>

'),


('Infiniroll Evo GenB', 'Infiniroll', 'Infiniroll Evo GenB.jpg', 196.82, 38.5, 5.14,
'
<h1>Infiniroll Evo GenB E-Scooter</h1>
<p>Der <strong>Infiniroll Evo GenB</strong> definiert Mobilität neu. Dieses Modell repräsentiert die Evolution unserer E-Scooter-Technologie und verbindet innovative Merkmale mit einem nachhaltigen Ansatz, um "Mobilität ohne Grenzen" zu bieten.</p>

<h2>Neudefinierte Grenzen</h2>
<p>Mit dem Infiniroll Evo GenB erleben Sie Freiheit auf eine ganz neue Art. Durch seine fortschrittliche Technologie bietet er eine Mobilitätslösung, die Sie weiter bringt, ohne die Umwelt zu belasten.</p>

<h2>Evolutionäres Design</h2>
<p>Das Design des Infiniroll Evo GenB ist das Ergebnis kontinuierlicher Weiterentwicklung und Perfektionierung. Es kombiniert Langlebigkeit mit einem modernen Aussehen, das nicht nur funktional, sondern auch ein echter Hingucker ist.</p>

<h2>Intelligente Konnektivität</h2>
<p>Der Infiniroll Evo GenB geht mit der Zeit. Er bietet erweiterte App-Funktionalitäten, die es Ihnen erlauben, Ihren Scooter zu personalisieren, Fortbewegungsdaten zu analysieren und Sicherheitseinstellungen vorzunehmen – intuitiv und einfach.</p>

<h2>Nachhaltig Unterwegs</h2>
<p>Der Infiniroll Evo GenB steht im Einklang mit unserem Planeten. Durch die Verwendung von umweltfreundlichen Materialien und dem Einsatz der effizientesten Antriebstechnologien setzen wir ein klares Zeichen für nachhaltige Mobilität.</p>

<h2>Maximaler Komfort</h2>
<p>Beim Infiniroll Evo GenB steht Ihr Komfort an erster Stelle. Eine optimierte Fahrfläche, adaptive Fahrmodi und ein hochwertiges Dämpfungssystem sorgen für eine Fahrt, die so komfortabel wie aufregend ist.</p>

<p>Der <strong>Infiniroll Evo GenB</strong> ist nicht nur ein Fortschritt in der Mobilitätstechnologie, er ist eine Verpflichtung zu einer besseren, nachhaltigeren und angenehmeren Art der Fortbewegung. Steigen Sie jetzt um und erfahren Sie, was es heißt, ohne Grenzen unterwegs zu sein.</p>

'),


('Infiniroll Evo 3+', 'Infiniroll', 'Infiniroll Evo 3+.jpg', 120.03, 31, 11.18,
'
<h1>Infiniroll Evo 3+ E-Scooter</h1>
<p>Treffen Sie den <strong>Infiniroll Evo 3+</strong>, den Höhepunkt unserer Bemühungen, die ultimative Lösung für urbane Mobilität zu schaffen. Der Evo 3+ ist das Ergebnis unermüdlicher Innovation und Verbesserung, entworfen, um Sie stilvoll und effizient durch jedes urbane Abenteuer zu begleiten.</p>

<h2>Grenzüberschreitende Mobilität</h2>
<p>Der Infiniroll Evo 3+ stellt die Grenzen der traditionellen Mobilität in Frage und eröffnet neue Wege der Fortbewegung. Erleben Sie eine neue Form der Freiheit, unterstützt durch modernste Technologie, die eine nahtlose Integration in Ihr Leben ermöglicht.</p>

<h2>Innovatives Design</h2>
<p>Mit seinem schlanken, aerodynamischen Rahmen und der markanten Linienführung kombiniert der Evo 3+ Funktionalität mit einem unverwechselbaren Stil. Er wurde entwickelt, um nicht nur äußerlich zu beeindrucken, sondern auch durch seine Performance zu überzeugen.</p>

<h2>Verbindung neu definiert</h2>
<p>Der Infiniroll Evo 3+ vernetzt Sie intelligenter mit der Welt. Durch die fortschrittliche App-Integration können Sie Einstellungen anpassen, Ihre Fahrten optimieren und immer einen Schritt voraus sein.</p>

<h2>Verpflichtet zur Umwelt</h2>
<p>Wir nehmen unsere Verantwortung für den Planeten ernst. Der Evo 3+ nutzt die effizienteste verfügbare Antriebstechnik und setzt auf nachhaltige Materialien, um die Umweltauswirkungen zu minimieren.</p>

<h2>Exzeptioneller Fahrkomfort</h2>
<p>Der Evo 3+ definiert Komfort neu. Seine maßgeschneiderte Fahrfläche und das fortschrittliche Federungssystem bieten eine unübertroffene Fahrtqualität, egal unter welchen städtischen Bedingungen.</p>

<p>Mit dem <strong>Infiniroll Evo 3+</strong> erreichen Sie nicht nur Ihr Ziel, sondern genießen auch jede Sekunde der Reise. Erleben Sie die Zukunft der urbanen Mobilität – effizient, umweltfreundlich und stilvoll.</p>
'),


('Infiniroll Evo v2', 'Infiniroll', 'Infiniroll Evo v2.jpg', 129.81, 27.2, 10.04,
'
<h1>Infiniroll Evo v2 E-Scooter</h1>
<p>Entdecken Sie den <strong>Infiniroll Evo v2</strong>: Eine Evolution in Sachen urbane Mobilität, die Eleganz, Effizienz und fortschrittliche Technologie in einem nahtlosen Erlebnis vereint. Der Evo v2 baut auf dem Erbe seiner Vorgänger auf und setzt neue Standards für das Reisen in der Stadt und darüber hinaus.</p>

<h2>Revolutionäre Mobilität</h2>
<p>Der Infiniroll Evo v2 erweitert Ihre Mobilitätsgrenzen und ermöglicht es Ihnen, die Stadt auf eine Art und Weise zu erkunden, die bisher unvorstellbar war. Mit seiner fortschrittlichen Technologie wird jede Fahrt nicht nur zu einer Reise, sondern zu einem Erlebnis.</p>

<h2>Dynamisches Design</h2>
<p>Von der dynamischen Form bis zum minimalistischen Stil – der Evo v2 besticht durch sein innovatives Design, das sowohl funktional als auch visuell ansprechend ist. Ein wahres Meisterwerk der Ingenieurskunst, das Design und Leistung perfekt miteinander verbindet.</p>

<h2>Nahtlose Vernetzung</h2>
<p>Der Infiniroll Evo v2 macht Schluss mit herkömmlicher Mobilität. Dank integrierter App-Unterstützung und fortschrittlicher Konnektivitätsfunktionen können Sie Ihren Scooter personalisieren, Routen anpassen und Ihr Fahrerlebnis optimieren.</p>

<h2>Nachhaltige Fortbewegung</h2>
<p>Der Evo v2 ist ein Pionier in puncto umweltfreundliche Mobilität. Mit seinem emissionsfreien Antrieb und der Verwendung von recycelbaren Materialien führt er Sie nicht nur zu Ihrem Ziel, sondern schützt auch die Umwelt.</p>

<h2>Optimierter Komfort</h2>
<p>Der Infiniroll Evo v2 steht für außergewöhnlichen Fahrkomfort. Seine ergonomisch gestaltete Fahrfläche und das fortschrittliche Federungssystem sorgen für eine geschmeidige Fahrt, selbst auf den herausforderndsten Strecken.</p>

<p>Steigen Sie auf den <strong>Infiniroll Evo v2</strong> um und erleben Sie die nächste Stufe der urbanen Mobilität. Mit ihm wird jede Fahrt nicht nur zu einem Weg, sondern zu einem Teil Ihrer persönlichen Freiheit und Ihrem Beitrag zu einer grüneren Welt.</p>
'),


('Infiniroll Evo', 'Infiniroll', 'Infiniroll Evo.jpg', 251.19, 24.5, 10.86,
'
<h1>Infiniroll Evo E-Scooter</h1>
<p>Willkommen zum <strong>Infiniroll Evo</strong>, dem E-Scooter, der die Essenz urbaner Mobilität einfängt. Als Basisversion unserer innovativen Evo-Reihe, vereint der Infiniroll Evo zuverlässige Leistung mit einem intuitiven Design für den alltäglichen Pendler.</p>

<h2>Zuverlässige Mobilität</h2>
<p>Der Infiniroll Evo bietet eine solide Grundlage für Ihre täglichen Fahrten. Mit seiner robusten Bauweise und effizienten Leistung ist er der ideale Begleiter für den urbanen Raum – zuverlässig, wenn Sie ihn am meisten benötigen.</p>

<h2>Klassisches Design</h2>
<p>Mit seinem klaren, minimalistischen Design passt sich der Evo nahtlos in jeden Lebensstil ein. Seine zeitlose Ästhetik betont Funktionalität und Benutzerfreundlichkeit, ohne dabei Kompromisse bei der Form einzugehen.</p>

<h2>Einfache Handhabung</h2>
<p>Der Infiniroll Evo zeichnet sich durch seine einfache Bedienung und Handhabung aus. Von der schnellen Inbetriebnahme bis zur mühelosen Wartung – alles wurde mit dem Gedanken an Ihre Bequemlichkeit entworfen.</p>

<h2>Umweltbewusstsein</h2>
<p>Als Teil der Evo-Familie setzt auch der Infiniroll Evo auf eine umweltfreundliche Fortbewegung. Mit seinem emissionsfreien Antrieb tragen Sie aktiv zum Schutz unserer Umwelt bei, jedes Mal, wenn Sie sich für den Evo entscheiden.</p>

<h2>Angenehmes Fahrerlebnis</h2>
<p>Erleben Sie mit dem Evo ein angenehmes Fahrerlebnis. Sein stabiles Fahrverhalten und die effiziente Leistung sorgen für eine reibungslose Fahrt durch die Stadt, die Sie immer wieder genießen möchten.</p>

<p>Der <strong>Infiniroll Evo</strong> steht nicht nur für Mobilität, sondern auch für einen bewussten Lebensstil. Er ist die perfekte Wahl für all jene, die einen zuverlässigen, umweltfreundlichen und stilvollen E-Scooter suchen, der sie täglich begleitet.</p>
'),


('ThunderRide Max Pro', 'ThunderRide', 'ThunderRide Max Pro.jpg', 130.52, 26.9, 11.59,
'
<h1>ThunderRide Max Pro E-Scooter</h1>
<p>Entdecken Sie die Spitze moderner Mobilität mit dem <strong>ThunderRide Max Pro</strong>. Dieser E-Scooter kombiniert ein atemberaubendes, modernes Design mit einem leistungsstarken Antrieb für das ultimative Fahrerlebnis.</p>

<h2>Modernes Design</h2>
<ul>
<li>Ästhetisch ansprechendes, futuristisches Rahmen-Design</li>
<li>Elegante LED-Beleuchtung für optimale Sichtbarkeit</li>
<li>Integrierte digitale Anzeige für intuitive Bedienung</li>
</ul>

<h2>Schneller Antrieb</h2>
<ul>
<li>Leistungsstarker Motor für dynamische Beschleunigung</li>
<li>Effiziente Energieumwandlung für eine verbesserte Leistung</li>
<li>Optimierte Steuerung für reaktionsschnelle Manövrierfähigkeit</li>
</ul>

<h2>Zusätzliche Merkmale</h2>
<ul>
<li>Robustes Material für Langlebigkeit und Zuverlässigkeit</li>
<li>Leicht klappbar für bequemen Transport und Lagerung</li>
<li>Wasserdichtes Design für Allwettertauglichkeit</li>
<li>Umweltfreundliche Technologie für nachhaltige Fortbewegung</li>
</ul>

<p>Der <strong>ThunderRide Max Pro</strong> ist mehr als nur ein E-Scooter; er ist eine Erklärung für Designexzellenz und technologische Überlegenheit. Ob für die tägliche Pendelstrecke oder spontane Abenteuer, der ThunderRide Max Pro bietet eine unübertroffene Kombination aus Stil, Geschwindigkeit und Komfort. Erleben Sie die Zukunft der urbanen Mobilität heute.</p>
'),


('ElectraWave Elite', 'ElectraWave', 'ElectraWave Elite.jpg', 51.7, 35.4, 13.48,
'
<h1>ThunderRide Max Pro E-Scooter</h1>
<p>Erkunden Sie die Zukunft der urbanen Mobilität mit dem <strong>ThunderRide Max Pro</strong>, einem Meisterwerk der Innovation und Technik. Mit seinem bahnbrechenden, radlosen, futuristischen Design setzt dieser E-Scooter neue Standards in der Fortbewegung und ästhetischen Anziehungskraft.</p>

<h2>Futuristisches Design</h2>
<ul>
<li>Einzigartige, radlose Konstruktion, die auf modernster Schwebetechnologie basiert</li>
<li>Glattes und aerodynamisches Profil für eine unvergleichliche Silhouette</li>
<li>Integrierte, dynamische LED-Beleuchtung, die Sicherheit und Stil vereint</li>
</ul>

<h2>Leistungsmerkmale</h2>
<ul>
<li>Nahtlose Beschleunigung und hohe Effizienz dank fortschrittlichem Elektroantrieb</li>
<li>Intuitive Handhabung und Manövrierfähigkeit, die durch präzise Sensortechnologie ermöglicht wird</li>
<li>Robuste Bauweise, die eine lange Lebensdauer auch bei intensiver Nutzung gewährleistet</li>
</ul>

<h2>Zusätzliche Ausstattung</h2>
<ul>
<li>Smartes Display mit Echtzeitinformationen zu Fahrmodus, Batteriestatus und Navigation</li>
<li>App-Konnektivität für eine personalisierte Fahrerfahrung und Diebstahlsicherung</li>
<li>Umweltfreundliche Technologie, die einen geräuscharmen Betrieb und geringen Energieverbrauch bietet</li>
</ul>

<p>Der <strong>ThunderRide Max Pro</strong> ist nicht nur ein E-Scooter; er ist eine Vision der Zukunft, die heute realisiert wird. Steigen Sie ein und erleben Sie, wie er die Grenzen des Möglichen neu definiert – mit jedem Kilometer, den Sie zurücklegen.</p>
'),


('ElectraWave', 'ElectraWave', 'ElectraWave.jpg', 42.51, 30, 10.3,
'
<h1>ElectraWave E-Scooter</h1>
<p>Entdecken Sie die Basisversion des <strong>ElectraWave</strong>, den Einstieg in die Welt der zukunftsorientierten Mobilität. Der ElectraWave kombiniert effiziente Performance mit einem eleganten Design, um Ihnen eine zuverlässige und stilvolle Fortbewegungsmöglichkeit zu bieten.</p>

<h2>Elegantes Design</h2>
<ul>
<li>Minimalistisches und aerodynamisches Rahmen-Design für alltägliche Eleganz</li>
<li>Kompakte Bauweise, die einfache Lagerung und Transport ermöglicht</li>
<li>Integrierte LED-Beleuchtung für verbesserte Sichtbarkeit und Sicherheit</li>
</ul>

<h2>Zuverlässige Performance</h2>
<ul>
<li>Effizienter Antrieb für reibungslose Fahrten durch städtische Landschaften</li>
<li>Einfache Handhabung für eine intuitive Bedienung, ideal für Einsteiger und Profis</li>
<li>Langlebige Bauweise, die eine dauerhafte Nutzung gewährleistet</li>
</ul>

<h2>Umweltfreundliche Mobilität</h2>
<ul>
<li>Emissionsfreier Elektroantrieb für eine saubere Fortbewegung</li>
<li>Geräuscharmer Betrieb, der zur Reduzierung der Lärmbelastung in Städten beiträgt</li>
<li>Recycelbare Materialien, die das Engagement für Nachhaltigkeit unterstreichen</li>
</ul>

<p>Der <strong>ElectraWave</strong> ist mehr als nur ein E-Scooter; er ist ein Statement für moderne, umweltbewusste Mobilität. Perfekt für den städtischen Pendler oder Wochenendabenteurer, bietet der ElectraWave eine Kombination aus Design, Leistung und nachhaltiger Technologie, die ihn zur idealen Wahl für den bewussten Fahrer macht.</p>
'),


('BauhausPacer 5G', 'Bauhaus', 'BauhausPacer 5G.jpg', 67.83, 38.3, 4.85,
'
<h1>BauhausPacer 5G E-Scooter</h1>
<p>Entdecken Sie den <strong>BauhausPacer 5G</strong>, einen E-Scooter, der die Prinzipien des Bauhaus-Designs in die moderne urbane Mobilität überträgt. Dieser Scooter verbindet Form und Funktion in einer Weise, die sowohl ästhetisch ansprechend als auch höchst praktisch ist, und setzt neue Maßstäbe in Sachen Stil und Leistung.</p>

<h2>Bauhaus-inspiriertes Design</h2>
<ul>
<li>Strikte Geometrien und klare Linienführung für eine zeitlose Ästhetik</li>
<li>Funktionalität und Einfachheit stehen im Mittelpunkt, ohne dekorative Elemente</li>
<li>Harmonische Integration der Komponenten für eine nahtlose Benutzererfahrung</li>
</ul>

<h2>Intuitive Bedienung</h2>
<ul>
<li>Benutzerzentrierte Schnittstelle, die Einfachheit und Zugänglichkeit betont</li>
<li>Nahtlose Verbindung mit Smart Devices für eine erweiterte Kontrolle und Überwachung</li>
<li>Adaptive Beleuchtungssysteme, die Sicherheit und Sichtbarkeit erhöhen</li>
</ul>

<h2>Nachhaltige Mobilitätslösung</h2>
<ul>
<li>Emissionsfreier Betrieb, der zur Reduzierung der Umweltbelastung beiträgt</li>
<li>Verwendung von nachhaltigen Materialien, die Langlebigkeit und Recycelbarkeit fördern</li>
<li>Effizienter Energieverbrauch durch innovative Antriebstechnologien</li>
</ul>

<p>Der <strong>BauhausPacer 5G</strong> repräsentiert eine Symbiose aus kulturellem Erbe und zukunftsorientierter Technologie. Für diejenigen konzipiert, die Design schätzen und eine nachhaltige Lebensweise anstreben, bietet dieser E-Scooter eine unvergleichliche Fahrerfahrung, die in der städtischen Landschaft heraussticht.</p>
'),


('Komodo 3000', 'Komodo', 'Komodo 3000.jpg', 43.72, 22.9, 7.49,
'
<h1>Komodo 3000 E-Scooter</h1>
<p>Der <strong>Komodo 3000</strong> definiert den Begriff Leistung in der Welt der E-Scooter völlig neu. Mit seiner hoch-explosiven Performance, die den Boden unter Ihren Füßen vibrieren lässt, und einem Design, das ebenso kraftvoll wie elegant ist, bricht der Komodo 3000 alle Grenzen der urbanen Fortbewegung.</p>

<h2>Durchschlagende Leistung</h2>
<ul>
<li>Revolutionärer Antrieb, der sofortige Beschleunigung ohne Kompromisse ermöglicht</li>
<li>Robuste Bauweise, die selbst den anspruchsvollsten Bedingungen standhält</li>
<li>Optimierte Energieeffizienz für eine nachhaltige, aber kraftvolle Fahrt</li>
</ul>

<h2>Unvergleichliches Design</h2>
<ul>
<li>Blendende Ästhetik, die Stärke und Dynamik ausstrahlt</li>
<li>Ergonomische Gestaltung für maximalen Fahrkomfort und einfache Handhabung</li>
<li>Integrierte Beleuchtung, die sowohl funktional als auch stilbildend wirkt</li>
</ul>

<h2>Technologische Innovation</h2>
<ul>
<li>Spitzentechnologie im Bereich der Steuerungs- und Sicherheitssysteme</li>
<li>Smart Connectivity für nahtlose Integration mit Ihren digitalen Geräten</li>
<li>Umweltfreundliche Technik, die Leistung mit Verantwortung vereint</li>
</ul>

<p>Der <strong>Komodo 3000</strong> ist nicht einfach nur ein E-Scooter; er ist ein kraftvolles Statement für alle, die sich nicht mit dem Gewöhnlichen zufriedengeben. Erleben Sie die Zukunft der Mobilität mit einer Kombination aus unübertroffener Leistung, bahnbrechendem Design und innovativer Technologie.</p>

'),


('ZippyZap 2022', 'Zippy', 'ZippyZap 2022.jpg', 76.63, 40, 6.85,
'
<h1>ZippyZap 2022 E-Scooter</h1>
<p>Der <strong>ZippyZap 2022</strong> bringt frischen Wind in die Welt der urbanen Mobilität. Dieser E-Scooter ist nicht nur ein Mittel zur Fortbewegung, sondern ein echtes Lifestyle-Produkt, das Design, Komfort und Leistung in einem einzigartigen Paket vereint. Ideal für den modernen Stadtbewohner, der Wert auf Effizienz, Stil und Spaß legt.</p>

<h2>Design-Highlights</h2>
<ul>
<li>Stylisches und kompaktes Design, das sich in jedem städtischen Umfeld sehen lassen kann</li>
<li>Leichte, aber robuste Bauweise für einfache Handhabung und Langlebigkeit</li>
<li>Farbenfrohe Optionen, die Ihrer Persönlichkeit entsprechen und aus der Masse herausstechen</li>
</ul>

<h2>Benutzerfreundlichkeit</h2>
<ul>
<li>Intuitives Faltsystem für eine schnelle und unkomplizierte Lagerung</li>
<li>Ergonomische Handgriffe und rutschfeste Trittfläche für sicheren Halt und Komfort</li>
<li>Leicht verständliches Dashboard, das alle wichtigen Informationen auf einen Blick bietet</li>
</ul>

<h2>Umweltfreundlich und Nachhaltig</h2>
<ul>
<li>Null Emissionen dank effizientem Elektroantrieb, ideal für umweltbewusste Nutzer</li>
<li>Wiederaufladbare Batterie mit langer Lebensdauer minimiert den ökologischen Fußabdruck</li>
<li>Einsatz von recycelbaren Materialien unterstreicht das Engagement für Nachhaltigkeit</li>
</ul>

<p>Der <strong>ZippyZap 2022</strong> steht für eine neue Ära der Mobilität, in der Komfort, Stil und Umweltbewusstsein Hand in Hand gehen. Egal, ob Sie zur Arbeit pendeln, durch die Stadt cruisen oder einfach nur Spaß haben möchten, der ZippyZap 2022 ist Ihr perfekter Begleiter für jeden Tag.</p>

'),


('ZippyZap 2023', 'Zippy', 'ZippyZap 2023.jpg', 53.17, 35.3, 9.15,
'
<h1>ZippyZap 2023 E-Scooter</h1>
<p>Der <strong>ZippyZap 2023</strong> repräsentiert die Evolution urbaner Mobilitätslösungen und setzt neue Maßstäbe in Design, Funktionalität und Nachhaltigkeit. Als jüngstes Modell in der innovativen ZippyZap-Reihe, kombiniert der 2023er E-Scooter die bewährte Zuverlässigkeit seiner Vorgänger mit modernsten Technologien und einem noch ansprechenderen Design. Dieser Scooter ist das Ergebnis intensiver Forschung und Entwicklung mit dem Ziel, das ultimative Fahrerlebnis zu bieten.</p>

<p>Im Herzen des <strong>ZippyZap 2023</strong> liegt ein Engagement für ausgezeichnete Leistung und Benutzerfreundlichkeit. Der E-Scooter zeichnet sich durch seine innovative Faltechnik aus, die es ermöglicht, den Scooter in Sekundenschnelle kompakt zusammenzufalten und somit Transport und Lagerung zu vereinfachen. Die ergonomischen Handgriffe und eine rutschfeste Trittfläche garantieren Komfort und Sicherheit bei jeder Fahrt, während das intuitive Dashboard Ihnen alle notwendigen Informationen liefert, ohne dass Sie den Blick von der Straße nehmen müssen.</p>

<p>Design steht beim <strong>ZippyZap 2023</strong> im Vordergrund. Die fließenden Linien und die dynamische Formgebung spiegeln den Geist moderner Urbanität wider. Erhältlich in verschiedenen Farboptionen, können Sie den E-Scooter wählen, der nicht nur Ihren praktischen Bedürfnissen entspricht, sondern auch Ihren persönlichen Stil unterstreicht. Die integrierte LED-Beleuchtung sorgt nicht nur für eine optimale Sichtbarkeit bei allen Lichtverhältnissen, sondern verleiht dem Scooter auch eine markante Optik.</p>

<p>Der <strong>ZippyZap 2023</strong> ist ein Vorreiter in Sachen umweltfreundlicher Mobilität. Mit seinem emissionsfreien Elektroantrieb trägt er aktiv zur Reduzierung der Umweltbelastung bei. Die Verwendung von recycelbaren Materialien und eine wiederaufladbare Batterie mit langer Lebensdauer zeugen von dem Bestreben, Nachhaltigkeit in jeden Aspekt des Designs zu integrieren. Dies macht den ZippyZap 2023 zum idealen Begleiter für umweltbewusste Stadtbewohner, die nicht zwischen Leistung und ökologischer Verantwortung wählen möchten.</p>

<p>Mit dem <strong>ZippyZap 2023</strong> sind Sie immer einen Schritt voraus. Ob auf dem Weg zur Arbeit oder beim entspannten Cruisen durch die Stadt, dieser E-Scooter bringt Sie nicht nur zuverlässig an Ihr Ziel, sondern macht jede Fahrt zu einem echten Erlebnis. Entdecken Sie jetzt, wie der ZippyZap 2023 die Art und Weise, wie Sie sich bewegen, revolutioniert.</p>

'),


('ZippyZap 2024', 'Zippy', 'ZippyZap 2024.jpg', 174.52, 36.8, 8.74,
'
<h1>ZippyZap 2024 E-Scooter</h1>
<p>Der <strong>ZippyZap 2024</strong> steht an der Spitze der urbanen Fortbewegung und verbindet nahtlos Spitzenleistung mit innovativer Technologie und umweltbewusstem Design. Als neueste Ergänzung der ZippyZap Familie setzt dieser E-Scooter neue Maßstäbe in Sachen Design, Komfort und Effizienz, ideal für den modernen Pendler und den umweltbewussten Abenteurer.</p>

<p>Design und Technologie gehen beim ZippyZap 2024 Hand in Hand, um ein Fahrerlebnis zu schaffen, das seinesgleichen sucht. Mit seinem schlanken, aerodynamischen Profil, das nicht nur die Effizienz erhöht, sondern auch den urbanen Stil neu definiert, steht der ZippyZap 2024 für die perfekte Balance zwischen Form und Funktion. Die Integration von hochmodernen, benutzerfreundlichen Technologien wie einem fortschrittlichen Dashboard, das Ihnen alle notwendigen Informationen liefert, und der nahtlosen Verbindung mit Ihrem Smartphone über eine dedizierte App, hebt die Interaktion mit Ihrem E-Scooter auf eine neue Ebene.</p>

<p>Die Nachhaltigkeit des ZippyZap 2024 wird durch die Verwendung von umweltfreundlichen Materialien und einem emissionsfreien Elektroantrieb unterstrichen. Diese Merkmale zeigen, dass hohe Leistung und ökologische Verantwortung Hand in Hand gehen können. Darüber hinaus sorgt das innovative Energierückgewinnungssystem dafür, dass keine Fahrtenergie verschwendet wird, was die Effizienz und die Umweltverträglichkeit des Scooters weiter steigert.</p>

<p>Mit seinem leichten, aber robusten Rahmen, der für maximale Langlebigkeit und einfache Handhabung entwickelt wurde, ist der ZippyZap 2024 der ideale Begleiter für alle Ihre Reisen. Ob Sie durch die Stadt flitzen oder auf ruhigen Wegen entspannen möchten, dieser E-Scooter bietet die Flexibilität, Sicherheit und Leistung, die Sie benötigen, um Ihre Umgebung auf nachhaltige Weise zu erkunden.</p>

<p>Entdecken Sie den <strong>ZippyZap 2024</strong> und erleben Sie, wie er Ihre Mobilität transformiert. Mit seiner Kombination aus innovativem Design, fortschrittlicher Technologie und einem starken Fokus auf Nachhaltigkeit ist der ZippyZap 2024 mehr als nur ein E-Scooter – er ist ein Blick in die Zukunft der urbanen Fortbewegung.</p>
'),


('ZippyZap 2025', 'Zippy', 'ZippyZap 2025.jpg', 142.08, 31.7, 8.67,
'
<h1>ZippyZap 2025 E-Scooter</h1>
<p>Der <strong>ZippyZap 2025</strong> markiert den Beginn einer neuen Ära in der urbanen Mobilität, indem er avantgardistisches Design mit umweltfreundlicher Technologie vereint. Dieses Modell ist das Ergebnis fortschrittlicher Forschung und Entwicklung mit dem Ziel, ein außergewöhnliches Fahrerlebnis zu bieten, das keine Kompromisse in Sachen Stil, Leistung oder Nachhaltigkeit eingeht.</p>

<p>Der ZippyZap 2025 besticht durch sein revolutionäres Design, das Funktionalität und Ästhetik in perfekter Harmonie zusammenbringt. Seine schlanke Silhouette und die fließenden Linien wurden sorgfältig konzipiert, um nicht nur die Blicke auf sich zu ziehen, sondern auch die Aerodynamik und Effizienz zu optimieren. Die Integration von hochmodernen Materialien reduziert das Gesamtgewicht und erhöht gleichzeitig die Robustheit und Langlebigkeit des Scooters.</p>

<p>Die Technologie hinter dem ZippyZap 2025 setzt neue Standards. Ausgestattet mit einer intelligenten Steuerung, passt sich der Scooter dynamisch an die Fahrbedingungen an, um eine optimale Balance zwischen Geschwindigkeit und Energieverbrauch zu gewährleisten. Die nahtlose Konnektivität mit mobilen Geräten eröffnet neue Möglichkeiten für personalisierte Fahrerlebnisse und bietet Zugriff auf Echtzeit-Daten zur Fahrt, Wartung und Sicherheit.</p>

<p>Ein Kernaspekt des ZippyZap 2025 ist sein Engagement für Nachhaltigkeit. Der emissionsfreie Elektroantrieb, kombiniert mit einer energieeffizienten Batterietechnologie, minimiert den ökologischen Fußabdruck. Darüber hinaus fördert die Verwendung von recycelbaren und umweltverträglichen Materialien eine grünere Zukunft der Fortbewegung.</p>

<p>Der <strong>ZippyZap 2025</strong> ist nicht nur ein Fortbewegungsmittel; er ist ein Statement für eine bewusste Lebensweise und ein Vorbote für die Mobilität von morgen. Entdecken Sie, wie der ZippyZap 2025 Ihre täglichen Wege transformiert und Sie mit Stil, Leistung und einem klaren Gewissen ans Ziel bringt.</p>
'),


('ZippyZap 2026', 'Zippy', 'ZippyZap 2026.jpg', 355.54, 21.6, 10.06,
'
<h1>ZippyZap 2026 E-Scooter</h1>
<p>Der <strong>ZippyZap 2026</strong> verkörpert die Zukunft der urbanen Mobilität mit einem Schwerpunkt auf Nachhaltigkeit, Intelligenz und unübertroffener Benutzererfahrung. Als neuestes Modell der bahnbrechenden ZippyZap-Serie stellt der 2026er E-Scooter eine revolutionäre Kombination aus umweltfreundlicher Innovation und futuristischem Design dar, die für den anspruchsvollen Nutzer von heute konzipiert ist.</p>

<p>Mit seinem schlanken und ergonomischen Design, das nicht nur die Ästhetik, sondern auch die Funktionalität betont, bietet der ZippyZap 2026 eine nahtlose und komfortable Fahrt durch städtische Landschaften. Jedes Element, von den griffigen Handläufen bis zur stabilen Standfläche, wurde mit dem Ziel entworfen, eine optimale Benutzererfahrung zu gewährleisten, während die fortschrittliche Gewichtsverteilung und das niedrige Zentrum für Stabilität und Leichtigkeit bei jeder Bewegung sorgen.</p>

<p>Im Herzen des ZippyZap 2026 steckt eine intelligente Technologie, die Sicherheit und Effizienz neu definiert. Ausgestattet mit einem adaptiven Beleuchtungssystem, das auf Umgebungsbedingungen reagiert, und einem integrierten Sicherheitssystem, das sowohl den Fahrer als auch den Scooter schützt, setzt dieser E-Scooter neue Maßstäbe in der persönlichen Mobilität. Die Konnektivität mit Smartphone-Apps eröffnet darüber hinaus eine Welt der Personalisierung und macht die Verwaltung und Überwachung des Scooters intuitiver denn je.</p>

<p>Nachhaltigkeit ist ein Kernwert des ZippyZap 2026, was sich in der Auswahl der Materialien und der Antriebstechnologie widerspiegelt. Durch die Verwendung von recycelten und recycelbaren Materialien sowie einem energieeffizienten Elektroantrieb minimiert der ZippyZap 2026 seinen ökologischen Fußabdruck. Diese umweltbewussten Entscheidungen zeigen, dass fortschrittliche Mobilität und ökologische Verantwortung Hand in Hand gehen können.</p>

<p>Entdecken Sie den <strong>ZippyZap 2026</strong> und lassen Sie sich von seiner visionären Herangehensweise an die urbane Mobilität begeistern. Dieser E-Scooter ist nicht nur ein Fortbewegungsmittel, sondern ein Bekenntnis zu stilvoller, intelligenter und nachhaltiger Bewegung durch den urbanen Raum.</p>
'),


('TurboZing', 'Zippy', 'TurboZing.jpg', 53.3, 26.3, 14.48,
'
<h1>TurboZing E-Longboard</h1>
<p>Das <strong>TurboZing E-Longboard</strong> revolutioniert die Art und Weise, wie Sie sich in der Stadt bewegen. Mit seinem innovativen Design, das die Flexibilität eines Longboards mit der Kraft eines E-Scooters kombiniert, bietet der TurboZing eine einzigartige Balance zwischen Spaß und Funktionalität.</p>

<h2>Innovatives Design</h2>
<p>Das TurboZing E-Longboard zeichnet sich durch sein schlankes, aerodynamisches Design aus, das nicht nur für ein ansprechendes Äußeres sorgt, sondern auch die Handhabung und Leistung optimiert. Die robuste Bauweise garantiert Langlebigkeit, während das breite Deck eine stabile und komfortable Standfläche bietet.</p>

<h2>Benutzererfahrung</h2>
<p>Mit seinem intuitiven Steuerungssystem ermöglicht der TurboZing eine reibungslose und natürliche Fahrerfahrung. Ob Sie durch enge Gassen navigieren oder offene Straßen entlanggleiten, das TurboZing E-Longboard reagiert präzise auf Ihre Bewegungen und bietet uneingeschränkte Kontrolle.</p>

<h2>Umweltfreundliche Mobilität</h2>
<p>Der TurboZing steht nicht nur für Spaß und Flexibilität, sondern auch für umweltfreundliche Fortbewegung. Sein emissionsfreier Elektroantrieb und die effiziente Batterietechnologie sorgen für eine saubere und nachhaltige Alternative zum traditionellen Stadtverkehr.</p>

<h2>Vielseitigkeit</h2>
<p>Ob für den täglichen Weg zur Arbeit, zum Cruisen am Wochenende oder als sportliches Fortbewegungsmittel – das TurboZing E-Longboard passt sich perfekt an Ihre Bedürfnisse an. Seine Vielseitigkeit macht es zum idealen Begleiter für jedes urbane Abenteuer.</p>

<p>Entdecken Sie mit dem <strong>TurboZing E-Longboard</strong> eine neue Dimension der Mobilität. Es verbindet auf einzigartige Weise die Freiheit und den Spaß eines Skateboards mit der Leistung und Bequemlichkeit eines E-Scooters. Steigen Sie um auf TurboZing und erleben Sie die Stadt wie nie zuvor.</p>
'),


('TurboZing Mini', 'Zippy', 'TurboZing Mini.jpg', 70.92, 25.5, 8.51,
'
<h1>TurboZing Mini E-Scooter</h1>
<p>Der <strong>TurboZing Mini</strong> definiert Mobilität neu durch sein ultra-kompaktes und portables Design. Ideal für den urbanen Pendler, der Wert auf Leichtigkeit und Bequemlichkeit legt, kombiniert dieser E-Scooter innovative Technologie mit außergewöhnlicher Flexibilität.</p>

<h2>Ultra-Kompaktes Design</h2>
<p>Der TurboZing Mini zeichnet sich durch seine kleine Statur und sein leichtes Gewicht aus, was ihn zum perfekten Begleiter für den täglichen Gebrauch macht. Sein cleveres Faltmechanismus-System ermöglicht es, den Scooter in Sekunden zu komprimieren und problemlos zu transportieren oder zu verstauen.</p>

<h2>Maximale Portabilität</h2>
<p>Ob in öffentlichen Verkehrsmitteln, unter dem Schreibtisch im Büro oder im Kofferraum eines Autos – der TurboZing Mini passt überall hin. Seine portabilität revolutioniert die Art und Weise, wie Sie sich in der Stadt bewegen und bietet eine unvergleichliche Freiheit.</p>

<h2>Benutzerfreundliche Bedienung</h2>
<p>Mit seiner intuitiven Bedienung ist der TurboZing Mini ideal für jeden, vom E-Scooter-Neuling bis zum erfahrenen Pendler. Die einfache Handhabung sorgt für eine sichere und angenehme Fahrt auf allen städtischen Wegen.</p>

<h2>Nachhaltige Mobilität</h2>
<p>Der emissionsfreie Elektroantrieb des TurboZing Mini unterstreicht das Engagement für eine umweltfreundlichere Fortbewegung. Kompakt, effizient und leise – dieser E-Scooter ist eine exzellente Wahl für bewusste Städter, die ihre CO2-Bilanz verringern möchten.</p>

<p>Entdecken Sie mit dem <strong>TurboZing Mini</strong> die ultimative Lösung für urbane Mobilität. Er bietet nicht nur eine einfache und effiziente Möglichkeit, sich fortzubewegen, sondern setzt auch neue Maßstäbe in Sachen Design und Nachhaltigkeit. Machen Sie den TurboZing Mini zu Ihrem täglichen Begleiter und navigieren Sie mit Stil durch das urbane Leben.</p>
'),


('SnowPulse X2', 'Zippy', 'SnowPulse X2.jpg', 10.08, 30.5, 11.26,
'
<article>
<h1>SnowPulse X2 E-Scooter</h1>
<p>Der <strong>SnowPulse X2</strong> ist Ihr ultimativer Begleiter für die winterliche Mobilität. Dieser speziell für Schneebedingungen entwickelte E-Scooter kombiniert robuste Bauweise mit innovativer Technologie, um eine sichere und effiziente Fortbewegung auch auf verschneiten und eisigen Wegen zu gewährleisten.</p>

<h2>Schneetauglichkeit</h2>
<p>Der SnowPulse X2 glänzt mit seiner herausragenden Schneetauglichkeit. Ausgestattet mit speziell entwickelten Reifen und einem Antriebssystem, das auch auf rutschigen Untergründen optimalen Halt bietet, meistert dieser E-Scooter selbst die herausforderndsten Winterbedingungen mit Bravour.</p>

<h2>Robustes Design</h2>
<p>Der SnowPulse X2 wurde für die Härten des Winters konzipiert. Seine wasser- und kälteresistente Bauweise schützt die technischen Komponenten vor den Elementen, während das verstärkte Rahmenmaterial auch bei niedrigen Temperaturen maximale Stabilität und Langlebigkeit gewährleistet.</p>

<h2>Maximaler Komfort und Sicherheit</h2>
<p>Mit seinem ergonomischen Design und adaptiven Beleuchtungssystem sorgt der SnowPulse X2 auch in den dunklen Wintermonaten für eine komfortable und sichere Fahrt. Die intuitiven Steuerungselemente ermöglichen eine präzise Handhabung, während das Anti-Rutsch-Trittblech zusätzliche Sicherheit bietet.</p>

<h2>Umweltfreundlich durch den Winter</h2>
<p>Der SnowPulse X2 steht nicht nur für außergewöhnliche Leistung unter Winterbedingungen, sondern auch für eine umweltbewusste Fortbewegung. Der emissionsfreie Elektroantrieb minimiert die Umweltbelastung, sodass Sie Ihre Winterabenteuer mit gutem Gewissen genießen können.</p>

<p>Entdecken Sie mit dem <strong>SnowPulse X2</strong> die Freiheit, die Winterlandschaft auf eine ganz neue Art und Weise zu erkunden. Egal ob auf dem Weg zur Arbeit oder beim winterlichen Ausflug, der SnowPulse X2 bietet Ihnen die Leistung, Sicherheit und den Komfort, den Sie in der kalten Jahreszeit benötigen.</p>
'),


('SeaPulse X3', 'Zippy', 'SeaPulse X3.jpg', 176.58, 33.9, 4.27,
'
<h1>SeaPulse X3 E-Scooter</h1>
<p>Der <strong>SeaPulse X3</strong>, ein Meisterwerk der Ingenieurskunst, bricht alle Grenzen der Mobilität. Mit seinem revolutionären hybriden Design, das die Freiheit bietet, sowohl auf festem Untergrund als auch über die Weiten des Bodensees zu fahren, verkörpert dieser E-Scooter den Geist unseres Slogans: "Know no limits!"</p>

<h2>Hybrides Design</h2>
<p>Der SeaPulse X3 ist nicht nur ein gewöhnlicher E-Scooter; er ist eine Innovation, die die Art und Weise, wie wir uns fortbewegen, neu definiert. Ausgestattet mit einem fortschrittlichen Antriebssystem, das einen nahtlosen Übergang zwischen Land und Wasser ermöglicht, bietet der SeaPulse X3 unvergleichliche Flexibilität und Abenteuerlust.</p>

<h2>Ultimative Freiheit</h2>
<p>Erkunden Sie die Schönheit des Bodensees und seiner Ufer mit einem Fahrzeug, das keine Grenzen kennt. Der SeaPulse X3 eröffnet neue Wege der Erkundung und des Vergnügens, indem er die Barrieren zwischen unterschiedlichen Terrains beseitigt.</p>

<h2>Robuste Konstruktion</h2>
<p>Der SeaPulse X3 wurde für die Elemente gebaut. Seine robuste Konstruktion und wasserdichte Technologie garantieren Langlebigkeit und Zuverlässigkeit, egal ob Sie durch die Straßen cruisen oder die Wellen durchschneiden.</p>

<h2>Nachhaltige Abenteuer</h2>
<p>Mit dem SeaPulse X3 setzen Sie ein Zeichen für umweltbewusste Mobilität. Der emissionsfreie Elektroantrieb sorgt für eine saubere und effiziente Fortbewegung, die die Naturschönheiten schützt, die Sie zu erkunden suchen.</p>

<p>Der <strong>SeaPulse X3</strong> ist mehr als ein E-Scooter; er ist ein Portal zu unentdeckten Abenteuern und ungebundener Freiheit. "Know no limits!" und nehmen Sie das Steuer Ihres eigenen Abenteuers in die Hand, mit der neuesten Innovation in der Welt der hybriden Mobilität.</p>
'),


('Canyonero', 'Zippy', 'Canyonero.jpg', 5.87, 29.5, 9.1,
'
<h1>Canyonero E-Scooter</h1>
<p>Der <strong>Canyonero</strong> steht für unbändige Freiheit und die Fähigkeit, jedem Terrain zu trotzen. Als der ultimative Offroad-Scooter wurde der Canyonero für Abenteuerlustige entwickelt, die keine Kompromisse eingehen möchten. Er ist robust, zuverlässig und bereit, Sie überallhin zu begleiten, wo Ihre Abenteuerlust Sie hinzieht.</p>

<h2>Unerschrockene Robustheit</h2>
<p>Der Canyonero besticht durch seine außergewöhnliche Bauweise, die speziell für die Herausforderungen abseits befestigter Wege entwickelt wurde. Mit einem verstärkten Rahmen, stoßdämpfenden Reifen und einem Hochleistungsantrieb ist dieser Scooter auf Langlebigkeit und Leistung in rauen Umgebungen ausgelegt.</p>

<h2>All-Terrain Vielseitigkeit</h2>
<p>Ob Schlamm, Sand, Kies oder Waldwege – der Canyonero meistert jede Herausforderung mit Bravour. Seine speziell entwickelten Offroad-Reifen bieten optimalen Halt und Stabilität auf allen Untergründen, sodass Sie das Unbekannte mit Vertrauen erkunden können.</p>

<h2>Maximaler Komfort</h2>
<p>Trotz seiner robusten Natur bietet der Canyonero ein erstaunlich komfortables Fahrerlebnis. Ergonomische Handgriffe, ein breites Trittboard und eine effektive Stoßdämpfung sorgen dafür, dass Sie auch auf den längsten Fahrten entspannt bleiben.</p>

<h2>Nachhaltiges Abenteuer</h2>
<p>Der Canyonero kombiniert Offroad-Leistung mit umweltfreundlicher Effizienz. Der leistungsstarke Elektroantrieb ermöglicht eine saubere und leise Fortbewegung, die es Ihnen erlaubt, die Natur ohne schädliche Emissionen zu genießen.</p>

<p>Mit dem <strong>Canyonero</strong> gibt es keine Grenzen mehr für Ihre Abenteuer. Er ist der perfekte Partner für alle, die die Freiheit suchen, jeden Pfad zu erkunden und dabei die Umwelt zu respektieren. Steigen Sie auf den Canyonero um und erleben Sie die Welt abseits der ausgetretenen Pfade.</p>

'),


('Volt Stream Surge', 'Voltswagen', 'Volt Stream Surge.jpg', 325.15, 32.5, 5.72,
'
<h1>Volt Stream Surge E-Scooter</h1>
<p>Der <strong>Volt Stream Surge</strong> vereint fortschrittliche Technologie mit einem eleganten Design, um Ihnen eine unübertroffene Fahrerfahrung zu bieten. Dieser E-Scooter ist für den modernen Städter konzipiert, der sowohl Stil als auch Funktionalität schätzt. Er ist Ihr idealer Partner für die tägliche Pendelstrecke oder Wochenendabenteuer in der Stadt.</p>

<h2>Modernes Design</h2>
<ul>
<li>Schlanke Silhouette mit aerodynamischen Kurven</li>
<li>Leichte, aber robuste Bauweise für einfache Handhabung</li>
<li>Elegante Farbgebung und LED-Beleuchtung für maximale Sichtbarkeit</li>
</ul>

<h2>Innovative Technologie</h2>
<p>Der Volt Stream Surge ist mit modernster Technologie ausgestattet, die eine effiziente und angenehme Fahrt garantiert. Ein hochentwickeltes Bremssystem bietet Sicherheit in jeder Situation, während die nahtlose Integration mit Smartphone-Apps es Ihnen ermöglicht, Ihre Fahrt zu personalisieren und wichtige Fahrdaten im Blick zu behalten.</p>

<h2>Benutzerfreundlichkeit</h2>
<ul>
<li>Intuitives Faltsystem für kompakte Lagerung und Transport</li>
<li>Ergonomisch gestaltete Bedienelemente für eine einfache Steuerung</li>
<li>Wartungsarme Komponenten für langanhaltende Zuverlässigkeit</li>
</ul>

<h2>Nachhaltige Mobilität</h2>
<p>Der Volt Stream Surge steht nicht nur für persönliche Freiheit, sondern auch für umweltbewusstes Reisen. Der emissionsfreie Elektroantrieb und die nachhaltigen Materialien, aus denen dieser Scooter gefertigt ist, minimieren Ihren ökologischen Fußabdruck, während Sie die Stadt erkunden.</p>

<p>Mit dem <strong>Volt Stream Surge</strong> setzen Sie ein klares Statement für innovative, nachhaltige Mobilität. Erleben Sie die perfekte Verbindung von Design, Technologie und Umweltbewusstsein. Steigen Sie auf den Volt Stream Surge um und entdecken Sie die Stadt auf neue Art und Weise.</p>

'),


('Spark Bolt S1', 'Voltswagen', 'Spark Bolt S1.jpg', 100.71, 37.6, 7.43,
'
<h1>Spark Bolt S1 E-Scooter</h1>
<p>Der <strong>Spark Bolt S1</strong> definiert urbanes Fahren neu. Dieser E-Scooter kombiniert hervorragende Leistung mit einem stilvollen Design und ist der perfekte Begleiter für alle, die Wert auf Effizienz, Komfort und Stil legen.</p>

<h2>Design und Stil</h2>
<ul>
<li>Schlankes, aerodynamisches Design für eine herausragende Optik</li>
<li>Kompakte Bauweise, ideal für die urbane Mobilität</li>
<li>Attraktive Farbgebung und moderne Ästhetik, die in jeder Umgebung auffällt</li>
</ul>

<h2>Robuste Bauweise</h2>
<p>Der Spark Bolt S1 steht nicht nur für Stil, sondern auch für Langlebigkeit. Mit seinem robusten Rahmen und hochwertigen Materialien bietet er eine zuverlässige Performance, die Sie über Jahre begleiten wird.</p>

<h2>Intuitive Bedienung</h2>
<ul>
<li>Einfache Steuerung, die eine schnelle Eingewöhnung ermöglicht</li>
<li>Reaktionsschnelle Bremsen für Ihre Sicherheit</li>
<li>Praktische Faltmechanik für eine unkomplizierte Lagerung und Transport</li>
</ul>

<h2>Nachhaltige Mobilität</h2>
<p>Der Spark Bolt S1 fördert eine grüne Fortbewegung. Durch seinen effizienten Elektroantrieb reduziert er die Umweltbelastung und unterstützt ein nachhaltigeres Reiseverhalten in der Stadt.</p>

<p>Entscheiden Sie sich für den <strong>Spark Bolt S1</strong> und erleben Sie die optimale Kombination aus Design, Leistung und Nachhaltigkeit. Ob für den täglichen Pendelweg oder für Freizeitfahrten, der Spark Bolt S1 ist Ihre Wahl für eine stilvolle und umweltfreundliche Mobilität.</p>

'),


('Spark Bolt S2', 'Voltswagen', 'Spark Bolt S2.jpg', 219.75, 30.1, 13.29,
'
<h1>Spark Bolt S2 E-Scooter</h1>
<p>Entdecken Sie den <strong>Spark Bolt S2</strong>: Eine neue Ära der urbanen Mobilität. Dieser E-Scooter kombiniert innovative Technologie mit einem außergewöhnlichen Design, um eine nahtlose und stilvolle Fortbewegung in der Stadt zu gewährleisten. Der Spark Bolt S2 ist für den anspruchsvollen Stadtbewohner entwickelt, der nicht nur Effizienz, sondern auch Ästhetik und Nachhaltigkeit schätzt.</p>

<h2>Ästhetisches Design</h2>
<ul>
<li>Elegantes, stromlinienförmiges Profil, das Aufmerksamkeit erregt</li>
<li>Leichtbauweise, die Mobilität und Handhabung vereinfacht</li>
<li>Ansprechende Farbvarianten, die zu jedem Stil passen</li>
</ul>

<h2>Erweiterte Funktionalität</h2>
<p>Der Spark Bolt S2 setzt neue Maßstäbe in der Funktionalität. Mit seiner intuitiven Bedienung und den hochentwickelten Sicherheitsmerkmalen bietet er eine ausgezeichnete Kontrolle und Zuverlässigkeit, die das Fahren in städtischen Gebieten zu einem reinen Vergnügen macht.</p>

<h2>Komfort und Sicherheit</h2>
<ul>
<li>Advanced Stoßdämpfung für eine geschmeidige Fahrt auf städtischen Oberflächen</li>
<li>Integrierte Beleuchtungssysteme für optimale Sichtbarkeit bei allen Lichtverhältnissen</li>
<li>Benutzerfreundliche Schnittstellen und einstellbare Fahrmodi für eine personalisierte Fahrt</li>
</ul>

<h2>Umweltbewusstsein</h2>
<p>Der Spark Bolt S2 verkörpert das Streben nach einer umweltfreundlicheren Fortbewegung. Sein effizienter Elektroantrieb und die nachhaltigen Materialien, aus denen er gefertigt wird, tragen dazu bei, die städtische Luftqualität zu verbessern und den ökologischen Fußabdruck zu minimieren.</p>

<p>Wählen Sie den <strong>Spark Bolt S2</strong> für Ihre täglichen Wege und werden Sie Teil einer fortschrittlichen Gemeinschaft, die Wert auf Design, Komfort und umweltfreundliche Mobilität legt. Der Spark Bolt S2 ist mehr als ein E-Scooter – er ist ein Symbol für die Mobilität der Zukunft.</p>

'),


('Spark Bolt S3', 'Voltswagen', 'Spark Bolt S3.jpg', 250.69, 23.9, 14.3,
'
<h1>Spark Bolt S3 E-Scooter</h1>
<p>Der <strong>Spark Bolt S3</strong> repräsentiert die nächste Generation urbaner Fortbewegungsmittel. Entworfen für den dynamischen Stadtbewohner, verbindet dieser E-Scooter fortschrittliche Technologie mit umweltfreundlichen Materialien und einem Nutzererlebnis der Extraklasse.</p>

<h2>Fortschrittliche Technologie</h2>
<ul>
<li>Neueste Motor- und Batterietechnologie für eine leistungsstarke Fahrt</li>
<li>Intelligentes Managementsystem für optimale Energieeffizienz</li>
<li>Modernste Sicherheitsfeatures, die Zuverlässigkeit gewährleisten</li>
</ul>

<h2>Exzellentes Nutzererlebnis</h2>
<p>Der Spark Bolt S3 wurde mit dem Ziel entwickelt, das Fahren so angenehm und intuitiv wie möglich zu gestalten. Von der nahtlosen Beschleunigung bis zur ergonomischen Handhabung bietet dieser E-Scooter ein Fahrerlebnis, das seinesgleichen sucht.</p>

<h2>Komfort und Design</h2>
<ul>
<li>Ergonomisch geformte Griffe und ein rutschfestes Deck für höchsten Fahrkomfort</li>
<li>Schlankes, modernes Design, das sowohl funktional als auch visuell ansprechend ist</li>
<li>Kompakte Bauweise, die einfache Lagerung und Transport ermöglicht</li>
</ul>

<h2>Nachhaltige Mobilität</h2>
<p>Im Einklang mit der Verpflichtung zu einer grüneren Zukunft kombiniert der Spark Bolt S3 Effizienz mit Umweltverträglichkeit. Die Nutzung nachhaltiger Materialien und ein emissionsfreier Antrieb machen den Spark Bolt S3 zu einem Vorreiter in puncto umweltbewusste Mobilität.</p>

<p>Entscheiden Sie sich für den <strong>Spark Bolt S3</strong> und erleben Sie, wie er Ihre täglichen Fahrten transformiert. Mit seinem innovativen Ansatz in Technologie, Komfort und Umweltbewusstsein setzt der Spark Bolt S3 neue Standards für die urbane Fortbewegung.</p>

'),


('Spark Bolt S4', 'Voltswagen', 'Spark Bolt S4.jpg', 215.35, 38.4, 12.24,
'
<h1>Spark Bolt S4 E-Scooter</h1>
<p>Der <strong>Spark Bolt S4</strong> verkörpert die Zukunft der urbanen Mobilität, indem er Spitzenleistung mit nachhaltiger Technologie und herausragendem Design kombiniert. Dieser fortschrittliche E-Scooter wurde speziell für den umweltbewussten Stadtbewohner entwickelt und bietet eine optimale Mischung aus Effizienz, Stil und Komfort.</p>

<h2>Innovative Features</h2>
<ul>
<li>State-of-the-Art-Antriebssystem für reibungslose Beschleunigung und Manövrierbarkeit</li>
<li>Integriertes Sicherheitssystem für uneingeschränkte Zuverlässigkeit</li>
<li>Smart Connectivity für eine nahtlose Integration mit mobilen Geräten</li>
</ul>

<h2>Design und Komfort</h2>
<p>Der Spark Bolt S4 besticht durch sein ästhetisches und benutzerorientiertes Design. Seine schlanken Linien und die hochwertige Verarbeitung machen ihn nicht nur zu einem Blickfang, sondern garantieren auch eine angenehme und sichere Fahrt.</p>

<h2>Umweltfreundliche Mobilität</h2>
<ul>
<li>Emissionsfreier Elektroantrieb für saubere urbane Fortbewegung</li>
<li>Nachhaltige Materialien reduzieren den ökologischen Fußabdruck</li>
<li>Effiziente Batterietechnologie für längere Fahrten mit weniger Energieverbrauch</li>
</ul>

<h2>Benutzererfahrung</h2>
<p>Der Spark Bolt S4 ist darauf ausgerichtet, die Benutzererfahrung zu revolutionieren. Mit intuitiven Steuerungen, einem komfortablen Fahrwerk und einem flexiblen Faltungssystem bietet dieser E-Scooter eine unübertroffene Kombination aus Leichtigkeit der Nutzung und praktischer Funktionalität.</p>

<p>Wählen Sie den <strong>Spark Bolt S4</strong> für Ihre täglichen Fahrten und werden Sie Teil einer Bewegung, die stilvolle, effiziente und umweltbewusste urbane Mobilität schätzt. Mit dem Spark Bolt S4 bewegen Sie sich nicht nur fort, sondern setzen auch ein Zeichen für eine nachhaltigere Zukunft.</p>

'),


('Spark Bolt S5', 'Voltswagen', 'Spark Bolt S5.jpg', 214.59, 38.9, 8.72,
'
<h1>Spark Bolt S5 E-Scooter</h1>
<p>Der <strong>Spark Bolt S5</strong> ist die Quintessenz urbaner Fortbewegung, ein Meisterwerk der Mobilitätstechnologie. Entwickelt für den anspruchsvollen Städter, kombiniert dieser E-Scooter elegantes Design mit außergewöhnlicher Funktionalität und umweltfreundlicher Leistung.</p>

<h2>Spitzenleistung</h2>
<ul>
<li>Kraftvoller, aber leiser Elektroantrieb für beeindruckende Leistung</li>
<li>Optimierte Effizienz für längere Fahrten ohne Leistungsverlust</li>
<li>Zuverlässiges Bremssystem für maximale Sicherheit</li>
</ul>

<h2>Elegantes Design</h2>
<p>Der Spark Bolt S5 besticht durch sein futuristisches, benutzerfreundliches Design. Die harmonische Verbindung von Ästhetik und Ergonomie macht diesen E-Scooter nicht nur zu einem Hingucker, sondern gewährleistet auch ein angenehmes Fahrerlebnis.</p>

<h2>Benutzerfreundlichkeit</h2>
<ul>
<li>Intuitives Faltsystem für leichten Transport und platzsparende Lagerung</li>
<li>Smart-Connect-Funktionen für nahtlose Interaktion mit Ihrem Smartphone</li>
<li>Anpassbare Fahrmodi, die sich Ihren Bedürfnissen anpassen</li>
</ul>

<h2>Nachhaltige Mobilität</h2>
<p>Der Spark Bolt S5 repräsentiert ein neues Zeitalter der umweltbewussten Fortbewegung. Durch die Verwendung von nachhaltigen Materialien und einem emissionsfreien Antrieb setzt dieser E-Scooter ein starkes Zeichen für eine grünere, sauberere Zukunft.</p>

<p>Mit dem <strong>Spark Bolt S5</strong> wählen Sie nicht nur ein Fortbewegungsmittel, sondern eine Lebensweise. Erleben Sie uneingeschränkte Mobilität, die Design, Leistung und ökologische Verantwortung in einem revolutionären E-Scooter vereint.</p>

'),


('SuperSwift Plus', 'Voltswagen', 'SuperSwift Plus.jpg', 152.07, 533.9, 10.94,
'
<h1>SuperSwift Plus E-Scooter</h1>
<p>Entdecken Sie den <strong>SuperSwift Plus</strong>, den E-Scooter, der neue Maßstäbe in Sachen Geschwindigkeit und Leistung setzt. Entwickelt für Adrenalinjunkies und Geschwindigkeitsliebhaber, bietet der SuperSwift Plus extreme Beschleunigung und Höchstgeschwindigkeiten, die seinesgleichen suchen. "Fliegen Sie zum Ziel!" mit unvergleichlicher Effizienz und Präzision.</p>

<h2>Unübertroffene Geschwindigkeit</h2>
<ul>
<li>Extreme Beschleunigung für ein sofortiges Ansprechverhalten</li>
<li>Erreicht beeindruckende Höchstgeschwindigkeiten für schnelles Vorankommen</li>
<li>Perfekt abgestimmtes Getriebe für eine reibungslose Beschleunigungskurve</li>
</ul>

<h2>Robustes Design</h2>
<p>Der SuperSwift Plus zeichnet sich durch ein robustes Design aus, das speziell für hohe Geschwindigkeiten und Leistung konzipiert wurde. Sein strapazierfähiges Gehäuse und die hochwertigen Komponenten garantieren Langlebigkeit und Zuverlässigkeit, selbst unter anspruchsvollsten Bedingungen.</p>

<h2>Sicherheitsmerkmale</h2>
<ul>
<li>Fortgeschrittene Bremsysteme für maximale Kontrolle und Sicherheit</li>
<li>Hochleistungsbeleuchtung für ausgezeichnete Sichtbarkeit bei allen Lichtverhältnissen</li>
<li>Stabile Reifenkonstruktion für optimalen Halt auf verschiedenen Untergründen</li>
</ul>

<h2>Komfort und Bedienbarkeit</h2>
<p>Trotz seiner Fokussierung auf Geschwindigkeit kompromittiert der SuperSwift Plus nicht in Sachen Komfort. Ergonomische Features und eine benutzerfreundliche Schnittstelle sorgen für eine angenehme Fahrt und eine intuitive Steuerung, die Sie mit Leichtigkeit zum Ziel bringt.</p>

<p>Der <strong>SuperSwift Plus</strong> ist die ultimative Wahl für alle, die das Gefühl von Geschwindigkeit lieben und dabei keine Abstriche in Sachen Sicherheit und Komfort machen möchten. Steigen Sie auf den SuperSwift Plus um und erleben Sie, wie es ist, mit dem Wind zu fliegen.</p>

'),


('FluxCapacitor Cruiser', 'Voltswagen', 'FluxCapacitor Cruiser.jpg', 250.6, 38.8, 10.98,
'
<h1>FluxCapacitor Cruiser E-Scooter</h1>
<p>Der <strong>FluxCapacitor Cruiser</strong> bringt Sie nicht nur von A nach B, sondern katapultiert Sie in eine neue Dimension der urbanen Mobilität. Inspiriert von den neuesten Fortschritten in der Elektrofahrzeugtechnologie, verbindet dieser E-Scooter futuristisches Design mit beispielloser Funktionalität, um das ultimative Fahrerlebnis zu schaffen.</p>

<h2>Revolutionäres Design</h2>
<ul>
<li>Schlankes, aerodynamisches Profil, das für den urbanen Entdecker optimiert ist</li>
<li>Leichte, aber ultrastabile Bauweise für maximale Haltbarkeit</li>
<li>Innovative Materialien, die Stil mit Nachhaltigkeit verbinden</li>
</ul>

<h2>Nahtlose Integration</h2>
<p>Der FluxCapacitor Cruiser steht an der Spitze der technologischen Entwicklung. Er integriert sich nahtlos in Ihr digitales Leben durch fortschrittliche Konnektivitätsoptionen, die eine intuitive Steuerung und Überwachung des Scooters ermöglichen.</p>

<h2>Umweltbewusste Technologie</h2>
<ul>
<li>Emissionsfreier Elektroantrieb für eine saubere, grüne Fortbewegung</li>
<li>Effiziente Energienutzung, die die Umwelt schont und Betriebskosten senkt</li>
<li>Recycelbare Komponenten, die den ökologischen Fußabdruck minimieren</li>
</ul>

<h2>Unübertroffener Komfort</h2>
<p>Trotz seines futuristischen Ansatzes lässt der FluxCapacitor Cruiser keine Wünsche in Bezug auf Komfort offen. Eine ergonomische Bauweise und anpassbare Fahrmodi garantieren ein entspanntes Fahrerlebnis, selbst über längere Distanzen.</p>

<p>Wählen Sie den <strong>FluxCapacitor Cruiser</strong> für Ihre nächste urbane Expedition und erleben Sie die perfekte Symbiose aus Design, Technologie und Nachhaltigkeit. Dieser E-Scooter ist nicht nur ein Fortbewegungsmittel, sondern ein Statement für die Zukunft der Mobilität.</p>
'),

('RococoZoom', 'Voltswagen', 'RococoZoom.jpg', 96.43, 25.9, 4.88,
'
<h1>RococoZoom E-Scooter</h1>
<p>Erleben Sie mit dem <strong>RococoZoom</strong> eine außergewöhnliche Fusion aus historischer Eleganz und moderner Mobilität. Dieser E-Scooter besticht durch seinen schicken und bewundernswerten Rococo-Stil, der nicht nur einzigartig im Straßenbild ist, sondern auch eine Hommage an die kunstvolle Ästhetik einer vergangenen Epoche darstellt.</p>

<h2>Einzigartiges Rococo-Design</h2>
<ul>
<li>Detailreiche Verzierungen und elegante Kurven, inspiriert vom opulenten Rococo-Stil</li>
<li>Exquisite Farbgebung und kunstvolle Applikationen, die jedem Scooter ein individuelles Aussehen verleihen</li>
<li>Hochwertige Materialien und Verarbeitung, die Ästhetik und Langlebigkeit vereinen</li>
</ul>

<h2>Modernste Technologie</h2>
<p>Trotz seines historisch inspirierten Designs bietet der RococoZoom fortschrittliche Technologie und Funktionen, die ihn zum idealen Begleiter in der heutigen urbanen Landschaft machen. Genießen Sie eine nahtlose und effiziente Fortbewegung, unterstützt durch neueste E-Scooter-Technologien.</p>

<h2>Komfort und Bedienbarkeit</h2>
<ul>
<li>Ergonomisches Design für maximalen Fahrkomfort</li>
<li>Intuitive Bedienelemente, die eine leichte Handhabung ermöglichen</li>
<li>Praktisches Faltsystem für einfache Lagerung und Transport</li>
</ul>

<h2>Nachhaltige Mobilität</h2>
<p>Der RococoZoom verbindet seine ästhetische Raffinesse mit einem Engagement für Umweltfreundlichkeit. Sein emissionsfreier Betrieb und die Verwendung von nachhaltigen Materialien unterstreichen das Bestreben, einen positiven Beitrag zum Umweltschutz zu leisten.</p>

<p>Wählen Sie den <strong>RococoZoom</strong> und setzen Sie ein außergewöhnliches Statement in Sachen Stil und Mobilität. Dieser E-Scooter ist nicht nur ein Fortbewegungsmittel, sondern ein Kunstwerk, das die Blicke auf sich zieht und eine Brücke zwischen Vergangenheit und Zukunft schlägt.</p>
'),

('Volt Brutalizer', 'Voltswagen', 'Volt Brutalizer.jpg', 20.68, 37.6, 13.02,
'
<h1>Volt Brutalizer E-Scooter</h1>
<p>Der <strong>Volt Brutalizer</strong> definiert die Ästhetik urbaner Mobilität neu durch sein markantes brutalistisches Design. Dieser E-Scooter ist nicht nur ein Fortbewegungsmittel, sondern eine kühne Aussage, die Robustheit, Funktionalität und einen unverkennbaren Stil vereint.</p>

<h2>Brutalistisches Design</h2>
<ul>
<li>Strikte geometrische Formen und eine monolithische Erscheinung</li>
<li>Robuste Bauweise, die Haltbarkeit und Langlebigkeit garantiert</li>
<li>Minimalistische Ästhetik, die Funktionalität und Design in den Vordergrund stellt</li>
</ul>

<h2>Unübertroffene Robustheit</h2>
<p>Der Volt Brutalizer ist für die urbane Landschaft konzipiert und überzeugt durch seine unübertroffene Robustheit. Er meistert mühelos das raue Stadtleben, mit einer Bauweise, die auf Langlebigkeit ausgelegt ist, um Ihnen jahrelang zuverlässig zur Seite zu stehen.</p>

<h2>Praktische Funktionalität</h2>
<ul>
<li>Einfache Handhabung und Wartung, um den urbanen Alltag zu erleichtern</li>
<li>Effiziente Leistung, die eine zuverlässige Fortbewegung gewährleistet</li>
<li>Kompaktes Falt-Design für eine praktische Lagerung und Transport</li>
</ul>

<h2>Nachhaltige Performance</h2>
<p>Der Volt Brutalizer steht nicht nur für ästhetische und physische Robustheit, sondern auch für nachhaltige Mobilität. Sein effizienter Elektroantrieb fördert eine umweltschonende Fortbewegung, die der Vision einer grüneren Stadt entspricht.</p>

<p>Mit dem <strong>Volt Brutalizer</strong> wählen Sie einen E-Scooter, der die Prinzipien des Brutalismus in die moderne Mobilität überträgt – eine perfekte Mischung aus Stärke, Funktionalität und einem Design, das Aufmerksamkeit erregt. Machen Sie ein Statement und durchbrechen Sie die Monotonie des städtischen Pendelns.</p>
'),


('Volt Punk', 'Voltswagen', 'Volt Punk.jpg', 800.4, 31.3, 5.81,
'
<h1>Volt Punk E-Scooter</h1>
<p>Entdecken Sie den <strong>Volt Punk</strong>, einen E-Scooter, der mit seinem einzigartigen Dieselpunk-Design und einem authentischen Dieselantrieb die Grenzen der traditionellen urbanen Mobilität sprengt. Der Volt Punk ist eine Hommage an die rohe Energie und Innovation der Dieselpunk-Ära, perfekt für jene, die sich nach einem Fahrzeug sehnen, das sowohl in Sachen Stil als auch Leistung eine Klasse für sich ist.</p>

<h2>Dieselpunk-Design</h2>
<ul>
<li>Robuste Ästhetik mit Einflüssen aus der industriellen Revolution und der Retro-Futuristik</li>
<li>Authentische Materialien wie gebürsteter Stahl und Lederakzente</li>
<li>Detailreiche Verzierungen, die den charakteristischen Dieselpunk-Stil zum Leben erwecken</li>
</ul>

<h2>Einzigartiger Dieselantrieb</h2>
<p>Der Volt Punk bricht mit der Konvention durch seinen innovativen Dieselantrieb. Dieser bietet eine beeindruckende Leistung und eine hörbare Signatur, die die Aufmerksamkeit auf jeder Straße garantiert.</p>

<h2>Umweltbewusste Anpassungen</h2>
<ul>
<li>Modernisierte Verbrennungstechnologie für eine effizientere Kraftstoffnutzung</li>
<li>Emissionsreduzierende Maßnahmen, die den ökologischen Fußabdruck minimieren</li>
<li>Nachhaltige Materialwahl, die Langlebigkeit und Umweltverträglichkeit gewährleistet</li>
</ul>

<h2>Praktische Features</h2>
<p>Trotz seines nostalgischen Designs bietet der Volt Punk moderne Annehmlichkeiten, die eine komfortable und praktische Nutzung im Alltag sicherstellen. Vom ergonomischen Sitz bis hin zu benutzerfreundlichen Bedienelementen – dieser Scooter verbindet Vergangenheit und Zukunft auf nahtlose Weise.</p>

<p>Der <strong>Volt Punk</strong> ist mehr als nur ein E-Scooter; er ist eine Reise zurück in eine Zeit, in der Handwerk und Innovation Hand in Hand gingen. Für diejenigen, die das Außergewöhnliche suchen, bietet der Volt Punk eine unvergleichliche Kombination aus Stil, Leistung und einem Hauch von Nostalgie.</p>
'),


('Volt Brutalizer XR', 'Voltswagen', 'Volt Brutalizer XR.jpg', 70.25, 34.5, 10.73,
'
<h1>Volt Brutalizer XR E-Scooter</h1>
<p>Entdecken Sie den <strong>Volt Brutalizer XR</strong>, die neueste Evolution im Bereich der brutalistischen Mobilität. Dieses Modell baut auf dem Fundament seines Vorgängers auf und erweitert es um verbesserte Funktionen und noch robustere Materialien, die es zum ultimativen Gefährten für den modernen Urbanisten machen.</p>

<h2>Erweitertes Brutalistisches Design</h2>
<ul>
<li>Verfeinerte geometrische Formen, die Stärke und Präzision betonen</li>
<li>Noch robustere Bauweise für erhöhte Widerstandsfähigkeit gegenüber städtischen Herausforderungen</li>
<li>Einzigartige minimalistische Ästhetik, die den funktionalen Stil des Brutalismus neu interpretiert</li>
</ul>

<h2>Verbesserte Robustheit</h2>
<p>Der Volt Brutalizer XR setzt neue Maßstäbe in puncto Langlebigkeit. Mit einer noch widerstandsfähigeren Konstruktion und Materialien, die speziell für eine verlängerte Lebensdauer entwickelt wurden, ist dieser E-Scooter bereit, Sie auf all Ihren Abenteuern zu begleiten.</p>

<h2>Optimierte Funktionalität</h2>
<ul>
<li>Fortgeschrittene Handhabungseigenschaften für ein noch kontrollierteres Fahrerlebnis</li>
<li>Verbesserte Energieeffizienz für längere Fahrten ohne Kompromisse bei der Leistung</li>
<li>Erweitertes Falt-Design für noch einfachere Lagerung und Portabilität</li>
</ul>

<h2>Nachhaltige Mobilitätslösung</h2>
<p>Mit dem Volt Brutalizer XR entscheiden Sie sich nicht nur für ein kraftvolles Design, sondern auch für umweltbewusste Fortbewegung. Sein effizienter Elektroantrieb und die Verwendung nachhaltiger Materialien unterstreichen das Engagement für eine saubere und grüne Zukunft.</p>

<p>Der <strong>Volt Brutalizer XR</strong> ist mehr als nur ein Fortbewegungsmittel; er ist ein Statement. Ein Statement für all diejenigen, die im urbanen Dschungel nicht nur überleben, sondern prosperieren wollen. Wählen Sie den Volt Brutalizer XR für eine unvergleichliche Kombination aus Stil, Leistung und Nachhaltigkeit.</p>

'),


('Swift Stream - Baroque Edition', 'Swift', 'Swift Stream - Baroque Edition.jpg', 89.73, 31.7, 3.37,
'
<h1>Swift Stream - Baroque Edition E-Scooter</h1>
<p><i>Cruise in Style</i></p>
<p>Entdecken Sie die <strong>Swift Stream - Baroque Edition</strong>, eine außergewöhnliche Kreation, die in der Welt der E-Scooter ihresgleichen sucht. Dieses Modell definiert mit seinem prächtigen Barock-Design, das die Opulenz und den verschwenderischen Reichtum der Barockzeit widerspiegelt, den Begriff der urbanen Mobilität neu. Jedes Detail dieses Scooters wurde sorgfältig gestaltet, um nicht nur ein Fortbewegungsmittel, sondern ein wahres Kunstwerk zu sein, das die Ästhetik der Barockzeit in die Moderne überträgt.</p>

<h2>Exquisites Barock-Design</h2>
<p>Das Herzstück der <strong>Swift Stream - Baroque Edition</strong> ist zweifelsohne ihr exquisites Barock-Design. Von üppigen Verzierungen bis hin zu elegant geschwungenen Linien – dieser Scooter ist eine Hommage an die kunstvolle Pracht des Barock. Die detailreichen Muster und Ornamente, die jeden Zentimeter dieses Modells zieren, spiegeln den unverwechselbaren Stil und die Opulenz wider, die mit der Barockzeit assoziiert werden.</p>

<h2>Schicke Ästhetik und Detailreichtum</h2>
<ul>
<li>Die <strong>Swift Stream - Baroque Edition</strong> besticht durch ihre schicke Ästhetik, die in jedem Detail zum Ausdruck kommt. Das Zusammenspiel von Goldakzenten und sorgfältig ausgewählten Farbpaletten unterstreicht die Eleganz und den Reichtum des Barockstils.</li>
<li>Jedes Ornament, jede Kurve und jedes Muster dieses Scooters wurde mit größter Sorgfalt entworfen, um eine Hommage an die prachtvolle Kunst und Architektur der Barockzeit zu sein.</li>
<li>Die reichen Verzierungen und die komplexen Muster, die sowohl die Lenkstange als auch das Trittbrett zieren, sind nicht nur eine Zierde, sondern erzählen die Geschichte einer vergangenen Epoche voller Pracht und Prunk.</li>
</ul>

<h2>Unvergleichlicher Komfort und Praktikabilität</h2>
<p>Trotz seines luxuriösen Designs, bietet die <strong>Swift Stream - Baroque Edition</strong> einen unvergleichlichen Komfort und praktische Funktionalität. Die ergonomische Gestaltung sorgt für eine angenehme Handhabung, während das durchdachte Falt-Design eine einfache Lagerung und Transportabilität ermöglicht – ein perfektes Beispiel dafür, wie moderne Technologie und historische Ästhetik Hand in Hand gehen können.</p>

<h2>Nachhaltigkeit trifft auf barocke Pracht</h2>
<ul>
<li>Die <strong>Swift Stream - Baroque Edition</strong> ist nicht nur ein Meisterwerk der Ästhetik, sondern auch ein Beispiel für nachhaltige Mobilität. Ihr emissionsfreier Betrieb vereint umweltbewusstes Reisen mit dem opulenten Stil der Barockzeit.</li>
<li>Die Verwendung von umweltfreundlichen Materialien und die effiziente Antriebstechnologie machen diesen E-Scooter zu einer grünen Alternative für den urbanen Pendler, der keine Kompromisse in Sachen Stil und Umweltverantwortung eingehen möchte.</li>
<li>So verbindet die <strong>Swift Stream - Baroque Edition</strong> auf einzigartige Weise die Pracht und den Pomp des Barock mit der Nachhaltigkeit und Effizienz der modernen Fortbewegung, ein wahrhaft zeitgemäßes Kunstwerk auf Rädern.</li>
</ul>

<p>Der <strong>Swift Stream - Baroque Edition</strong> E-Scooter ist mehr als nur ein Transportmittel; er ist ein Ausdruck von Luxus, Stil und historischer Bewunderung, eingebettet in die Funktionalität und Nachhaltigkeit der heutigen Zeit. Wählen Sie diesen Scooter, um nicht nur durch die Stadt zu gleiten, sondern um eine Reise durch die Zeit zu unternehmen, in der Kunst und Mobilität eine harmonische Verbindung eingehen.</p>
'),


('Swift Stream - Gothic Edition', 'Swift', 'Swift Stream - Gothic Edition.jpg', 108.69, 25.4, 3.23,
'
<h1>Swift Stream - Gothic Edition E-Scooter</h1>
<p><i>Cruise in Style</i></p>
<p>Begeben Sie sich auf eine faszinierende Reise durch die dunklen Gassen der Gotik mit dem <strong>Swift Stream - Gothic Edition</strong> E-Scooter. Dieses faszinierende Modell vereint die mystische Eleganz gotischer Architektur mit modernster Mobilitätstechnologie, um ein Fahrerlebnis zu schaffen, das sowohl in seiner Ästhetik als auch in seiner Leistung unvergleichlich ist. Die Gothic Edition entführt Sie in eine Welt, in der die dunkle Pracht der Gotik auf die schlanke Effizienz zeitgenössischer Fortbewegung trifft.</p>

<h2>Schickes gotisches Design</h2>
<p>Der <strong>Swift Stream - Gothic Edition</strong> besticht durch sein einzigartiges Design, das von den tiefen, reichen Tönen gotischer Kathedralen und ihrer kunstvollen Steinmetzarbeit inspiriert ist. Dieses Modell ist eine Hommage an die gotische Kunst und bietet eine dunkle, aber schicke Ästhetik, die es von allen anderen E-Scootern abhebt.</p>

<h2>Eleganz in Dunkelheit</h2>
<ul>
<li>Die <strong>Swift Stream - Gothic Edition</strong> zeichnet sich durch seine tiefen, satten Schwarztöne und komplexen Verzierungen aus, die eine Aura von Geheimnis und Eleganz ausstrahlen.</li>
<li>Jedes Element, von den fein gearbeiteten Griffen bis zum majestätisch gestalteten Trittbrett, ist eine Ode an die gotische Ästhetik, die sowohl Bewunderer als auch Kenner der gotischen Kultur anspricht.</li>
<li>Die wiederholte Betonung gotischer Elemente in seinem Design macht den Swift Stream - Gothic Edition zu einem wahren Meisterwerk der Mobilität, das die Schönheit und Tiefe der Gotik in jeder Fahrt einfängt.</li>
</ul>

<h2>Ein Kunstwerk auf Rädern</h2>
<p>Der <strong>Swift Stream - Gothic Edition</strong> verkörpert nicht nur einen E-Scooter, sondern ein fahrendes Kunstwerk, das die dunkle Pracht und den raffinierten Stil der Gotik in den urbanen Raum bringt. Dieses Modell ist nicht nur eine Fortbewegungsmöglichkeit, sondern auch ein Statement-Stück, das die tiefen, geheimnisvollen Vibes der Gotik widerspiegelt.</p>

<h2>Nachhaltige Dunkelheit</h2>
<ul>
<li>Die <strong>Swift Stream - Gothic Edition</strong> kombiniert sein atemberaubendes Design mit einem Engagement für Nachhaltigkeit, indem es einen emissionsfreien Antrieb bietet, der umweltbewusstes Reisen in der Stadt ermöglicht.</li>
<li>Trotz seiner dunklen Erscheinung, trägt dieser Scooter zum Licht der umweltfreundlichen Mobilität bei, wobei er Effizienz und ästhetische Perfektion in Einklang bringt.</li>
<li>Die Wiederholung der gotischen Thematik in seinem umweltfreundlichen Ansatz zeigt, dass die Swift Stream - Gothic Edition eine Brücke zwischen der Vergangenheit und einer nachhaltigen Zukunft schlägt.</li>
</ul>

<p>Der <strong>Swift Stream - Gothic Edition</strong> E-Scooter ist eine Ode an die dunkle Eleganz und den raffinierten Stil der Gotik, geformt in ein modernes Mobilitätswunder. Dieses Modell ist mehr als nur ein Mittel zur Fortbewegung; es ist eine Einladung, die Geheimnisse und die Schönheit der dunklen gotischen Welt zu erkunden, während man die Verantwortung für eine grünere Welt trägt.</p>
'),


('Swift Stream - Art Deco Edition', 'Swift', 'Swift Stream - Art Deco Edition.jpg', 100.41, 22.7, 8.92,
'
<h1>Swift Stream - Art Deco Edition E-Scooter</h1>
<p><i>Cruise in Style</i></p>
<p>Betreten Sie eine Welt voller Eleganz und Stil mit dem <strong>Swift Stream - Art Deco Edition</strong> E-Scooter. Dieses Modell, inspiriert von der schillernden Ära des Art Deco, verkörpert die Essenz von Luxus und Design. Mit seiner ausdrucksstarken Formsprache und den ornamentalen Elementen ist der Swift Stream - Art Deco Edition eine Hommage an eine der einflussreichsten Designbewegungen des 20. Jahrhunderts. Er ist nicht nur ein Fortbewegungsmittel, sondern auch ein ausdrucksstarkes Kunstwerk, das den Geist des Art Deco in die moderne Welt trägt.</p>

<h2>Schickes Art Deco Design</h2>
<p>Der <strong>Swift Stream - Art Deco Edition</strong> zeichnet sich durch sein unverwechselbares Art Deco Design aus, das durch seine schicken geometrischen Muster, scharfen Linien und opulenten Details besticht. Dieses Modell ist eine Ode an die glamouröse Ära des Art Deco, die Ästhetik, Funktionalität und modernen Luxus in perfekter Harmonie vereint.</p>

<h2>Ausdrucksstarke Ästhetik</h2>
<ul>
<li>Der <strong>Swift Stream - Art Deco Edition</strong> besticht durch seine ästhetische Perfektion, die in jedem Detail zum Ausdruck kommt. Von den eleganten Kurven bis zu den luxuriösen Verzierungen – jedes Element dieses Scooters ist ein Meisterwerk des Designs.</li>
<li>Die wiederholte Betonung von Art Deco Elementen unterstreicht die einzigartige Schönheit dieses Scooters, der als Symbol für Stil und Eleganz dient.</li>
<li>Die opulenten und doch präzisen Details, die sowohl die Lenkstange als auch das Trittbrett zieren, spiegeln den charakteristischen Art Deco Stil wider, der sowohl Bewunderer als auch Kenner der Ära anspricht.</li>
</ul>

<h2>Luxuriöse Funktionalität</h2>
<p>Abgesehen von seiner beeindruckenden Ästhetik, bietet der <strong>Swift Stream - Art Deco Edition</strong> E-Scooter eine luxuriöse Funktionalität. Seine hochmoderne Technologie und die benutzerfreundlichen Features sorgen für eine nahtlose und stilvolle Fortbewegung, die die Grenzen zwischen Kunst und Mobilität verwischt.</p>

<h2>Verpflichtung zu Exzellenz</h2>
<ul>
<li>Der <strong>Swift Stream - Art Deco Edition</strong> vereint nicht nur Design und Funktionalität, sondern ist auch ein Zeichen für Qualität und Langlebigkeit. Die Verwendung von hochwertigen Materialien und die sorgfältige Verarbeitung garantieren eine dauerhafte Schönheit und Leistung.</li>
<li>Die wiederholte Integration von Art Deco Designprinzipien in jedes Element dieses Scooters macht ihn zu einem zeitlosen Stück, das die Exzellenz und den Glanz der Art Deco Bewegung widerspiegelt.</li>
<li>Die Hingabe zur Perfektion, die in der Swift Stream - Art Deco Edition zum Ausdruck kommt, unterstreicht das Engagement des Herstellers, nicht nur ein Fortbewegungsmittel, sondern ein echtes Sammlerstück zu schaffen, das die Bewunderung und das Erbe des Art Deco feiert.</li>
</ul>

<p>Der <strong>Swift Stream - Art Deco Edition</strong> E-Scooter ist mehr als nur ein Weg, sich fortzubewegen; er ist eine Verkörperung von Stil, Geschichte und Innovation. Dieses Modell bietet eine einzigartige Möglichkeit, die Pracht des Art Deco in jeder Fahrt zu erleben und gleichzeitig ein Statement für zeitgenössische Eleganz und Designbewusstsein zu setzen.</p>
'),


('Swift Stream - Art Nouveau Edition', 'Swift', 'Swift Stream - Art Nouveau Edition.jpg', 104.54, 35.4, 11.5,
'
<h1>Swift Stream - Art Nouveau Edition E-Scooter</h1>
<p><i>Cruise in Style</i></p>
<p>Der <strong>Swift Stream - Art Nouveau Edition</strong> E-Scooter entführt Sie in die faszinierende Welt des Art Nouveau, einer Epoche, die für ihre fließenden Linien, organischen Formen und ihr einzigartiges Design bekannt ist. Dieses exklusive Modell ist eine Hommage an die kunstvolle Eleganz des Art Nouveau und vereint geschmeidiges Design mit modernster Mobilitätstechnologie. Jedes Element des Scooters wurde sorgfältig gestaltet, um die Ästhetik und den Geist des Art Nouveau widerzuspiegeln, wodurch er nicht nur ein Fortbewegungsmittel, sondern ein wahres Kunstwerk darstellt.</p>

<h2>Schickes Art Nouveau Design</h2>
<p>Die <strong>Swift Stream - Art Nouveau Edition</strong> zeichnet sich durch ihr schickes Design aus, das die typischen Merkmale des Art Nouveau aufgreift. Von den geschwungenen Linien bis zu den detailreichen, naturinspirierten Motiven – dieser Scooter ist ein Paradebeispiel für die Eleganz und den Flair des Art Nouveau. Die wiederholte Betonung des Art Nouveau Designs verleiht dem Scooter eine unverwechselbare Identität und macht ihn zu einem Symbol für Stil und Raffinesse.</p>

<h2>Einzigartige Eleganz und Form</h2>
<ul>
<li>Die <strong>Swift Stream - Art Nouveau Edition</strong> besticht durch ihre einzigartige Eleganz, die in jedem Detail zum Ausdruck kommt. Die organischen Formen und die fließenden Linien, die für den Art Nouveau typisch sind, verleihen dem Scooter eine natürliche und harmonische Ästhetik.</li>
<li>Die wiederholte Integration von Motiven, die von der Natur inspiriert sind, in das Design des Scooters unterstreicht die tiefe Verbindung zwischen dem Art Nouveau Stil und der natürlichen Welt.</li>
<li>Die sorgfältige Ausarbeitung jedes einzelnen Details zeigt die Hingabe zur Perfektion und zur Schönheit des Art Nouveau, was den Swift Stream - Art Nouveau Edition zu einem Meisterwerk der Mobilität macht.</li>
</ul>

<h2>Luxuriöse Funktionalität</h2>
<p>Abseits seiner beeindruckenden Ästhetik bietet der <strong>Swift Stream - Art Nouveau Edition</strong> E-Scooter eine luxuriöse Funktionalität, die moderne Technologie mit dem klassischen Design des Art Nouveau verbindet. Die nahtlose Integration fortschrittlicher Mobilitätslösungen in das stilvolle Design sorgt für ein Fahrerlebnis, das sowohl angenehm als auch effizient ist, und dabei die Eleganz des Art Nouveau beibehält.</p>

<h2>Verpflichtung zur ästhetischen Exzellenz</h2>
<ul>
<li>Der <strong>Swift Stream - Art Nouveau Edition</strong> verkörpert die Verpflichtung zur ästhetischen Exzellenz. Die Wahl hochwertiger Materialien und die detailreiche Verarbeitung garantieren nicht nur eine dauerhafte Schönheit, sondern auch eine unübertroffene Leistung.</li>
<li>Die wiederholte Darstellung von Art Nouveau Elementen in jedem Aspekt dieses Scooters macht ihn zu einem zeitlosen Stück, das sowohl die Vergangenheit feiert als auch die Zukunft der urbanen Mobilität gestaltet.</li>
<li>Die Hingabe zur Perfektion, die in der Swift Stream - Art Nouveau Edition zum Ausdruck kommt, zeigt das Bestreben, nicht nur ein Fortbewegungsmittel zu schaffen, sondern ein echtes Sammlerstück, das die Eleganz und den Geist des Art Nouveau in jeder Fahrt einfängt.</li>
</ul>

<p>Der <strong>Swift Stream - Art Nouveau Edition</strong> E-Scooter ist mehr als nur ein Mittel zur Fortbewegung; er ist eine Feier des Art Nouveau, eine Bewegung, die für ihre kunstvolle Gestaltung und ihre tiefe Verbindung zur Schönheit der natürlichen Welt bekannt ist. Dieses Modell bietet die seltene Gelegenheit, die Pracht des Art Nouveau zu erleben, während es ein Statement für zeitlose Eleganz und innovative Mobilität setzt.</p>
'),


('Swift Stream - Lego Edition', 'Swift', 'Swift Stream - Lego Edition.jpg', 298.25, 20.2, 10.27,
'
<h1>Swift Stream - Lego Edition E-Scooter</h1>
<p><i>Cruise in Style</i></p>
<p>Entdecken Sie die Welt der Mobilität neu mit dem <strong>Swift Stream - Lego Edition</strong> E-Scooter, einer revolutionären Kombination aus spielerischem Design und praktischer Modularität. Dieses einzigartige Modell, inspiriert von der zeitlosen Faszination der Lego-Bausteine, bringt die Kreativität und Vielseitigkeit des Bauens mit Lego in die Welt der urbanen Fortbewegung. Die Swift Stream - Lego Edition ist nicht nur ein Mittel zur Fortbewegung, sondern auch ein Ausdruck von Innovation und Individualität, der die bunte und modulare Natur von Lego perfekt einfängt.</p>

<h2>Schickes Lego-Design</h2>
<p>Die <strong>Swift Stream - Lego Edition</strong> zeichnet sich durch ihr schickes Lego-Design aus, das die ikonische Ästhetik der berühmten Bauklötze in jedes Element des Scooters integriert. Von den leuchtenden Farben bis zu den interaktiven, anpassbaren Oberflächen – dieser Scooter ist eine Hommage an die Kreativität und den Spielspaß, den Lego bietet.</p>

<h2>Modulare Innovation</h2>
<ul>
<li>Die <strong>Swift Stream - Lego Edition</strong> bringt ein beispielloses Maß an Modularität in die Mobilität. Jeder Teil des Scooters kann individuell angepasst oder ausgetauscht werden, was eine personalisierte und stets veränderbare Fortbewegungsmöglichkeit bietet.</li>
<li>Die wiederholte Hervorhebung der Modularität unterstreicht die Flexibilität und Anpassungsfähigkeit des Scooters, der sich mit wenigen Handgriffen an den persönlichen Stil und die Bedürfnisse des Nutzers anpassen lässt.</li>
<li>Diese Modularität erlaubt es, den Scooter ständig neu zu erfinden und zu personalisieren, was ihn zu einem wahren Meisterwerk der individuellen Ausdruckskraft macht.</li>
</ul>

<h2>Kreative und praktische Aspekte</h2>
<p>Abseits seiner beeindruckenden Optik bietet der <strong>Swift Stream - Lego Edition</strong> E-Scooter eine Kombination aus kreativer Ausdrucksmöglichkeit und praktischer Funktionalität. Die Baukasten-Logik von Lego wird auf die Fortbewegung übertragen, was nicht nur für ein unterhaltsames, sondern auch für ein äußerst funktionales Fahrerlebnis sorgt.</p>

<h2>Ein Spielplatz der Möglichkeiten</h2>
<ul>
<li>Der <strong>Swift Stream - Lego Edition</strong> verwandelt die städtische Mobilität in einen Spielplatz der Möglichkeiten. Durch seine Bauweise, die an die unendlichen Konstruktionsmöglichkeiten von Lego erinnert, eröffnet er eine Welt voller kreativer Freiheit und Innovation.</li>
<li>Die Betonung der vielfältigen Gestaltungsmöglichkeiten zeigt, wie dieser Scooter nicht nur die Fortbewegung revolutioniert, sondern auch den Weg dorthin zu einem Teil des Vergnügens macht.</li>
<li>Durch die Möglichkeit, den Scooter immer wieder neu zu gestalten, bietet die Swift Stream - Lego Edition ein einzigartiges Erlebnis, das die Grenzen zwischen Spiel und praktischer Anwendung verwischt.</li>
</ul>

<p>Der <strong>Swift Stream - Lego Edition</strong> E-Scooter ist mehr als nur ein Fahrzeug; er ist eine Einladung, die Welt der Mobilität mit den Augen der Kreativität zu betrachten und zu erkunden. Mit seiner Mischung aus schickem Design, modularer Bauweise und der unbegrenzten Möglichkeit zur Personalisierung ist dieser Scooter ein wahres Meisterwerk der modernen Urbanität, das die spielerische Ingenieurskunst von Lego in die Realität des täglichen Pendelns bringt.</p>
');







INSERT INTO Scooters (product_id, battery, coordinates_lng, coordinates_lat) VALUES

('Nimbus 2000', 22.97457332248678, 9.177526,47.665064),
('Nimbus 2000+', 90.89170436299689, 9.183424,47.666621),
('Nimbus 2000++', 100, 9.185780,47.666798),
('Infiniroll X Master', 84.557301538015346, 9.185820,47.669742),
('Infiniroll X Pro', 37.868789627598254, 9.187923,47.670624),
('Infiniroll Evo GenB', 100, 9.187788,47.689572),
('Infiniroll Evo 3+', 60.70715492583112, 9.184329,47.690959),
('Infiniroll Evo v2', 57.40000843991773, 9.188100,47.691721),
('Infiniroll Evo', 100, 9.193363,47.692649),
('ThunderRide Max Pro', 39.76110605218752, 9.164287,47.672096),
('ElectraWave Elite', 74.62355491089257, 9.161597,47.669038),
('ElectraWave', 42.2089065801561, 9.157491,47.672273),
('BauhausPacer 5G', 44.71069134064953, 9.152147,47.673824),
('Komodo 3000', 31.528726909388325, 9.153067,47.678614),
('ZippyZap 2022', 91.96564898260904, 9.156572,47.685221),
('ZippyZap 2023', 24.3981066010575, 9.160881,47.688746),
('ZippyZap 2024', 100, 9.164576,47.671165),
('ZippyZap 2025', 15.990368243701369, 9.167340,47.662229),
('ZippyZap 2026', 58.88216381451545, 9.172097,47.661908),
('TurboZing', 76.43448701095723, 9.172548,47.662845),
('TurboZing Mini', 56.266388534923806, 9.175959,47.663683),
('SnowPulse X2', 28.769696969547944, 9.175187,47.663409),
('SeaPulse X3', 32.492250693448746, 9.175389,47.664811),
('Canyonero', 55.081267261015896, 9.168968,47.658434),
('Volt Stream Surge', 86.83918716316231, 9.168119,47.658365),
('Spark Bolt S2', 96.22979351099572, 9.178078,47.657668),
('Spark Bolt S3', 61.80322656268456, 9.177014,47.659284),
('Spark Bolt S4', 58.43073120257245, 9.177173,47.659738),
('Spark Bolt S5', 23.104002351283782, 9.175757,47.660328),
('SuperSwift Plus', 63.57265766982096, 9.179005,47.662398),
('FluxCapacitor Cruiser', 78.44130179520066, 9.175816,47.664651),
('RococoZoom', 39.709807180359505, 9.175816,47.664651),
('Volt Brutalizer', 7.668444457285806, 9.214016,47.666584),
('Volt Punk', 1.876664216386996, 9.214059,47.665746),
('Volt Brutalizer XR', 82.4559070718202, 9.205376,47.678790),
('Swift Stream - Baroque Edition', 23.312174953981856, 9.209182,47.681918),
('Swift Stream - Gothic Edition', 14.215025903844204, 9.189744,47.687897),
('Swift Stream - Art Deco Edition', 0.03724246458867153, 9.173823,47.662275),
('Swift Stream - Art Nouveau Edition', 0.6602900938033063, 9.173248,47.660697),
('Swift Stream - Lego Edition', 78.10072630395919, 9.177076,47.661260);

