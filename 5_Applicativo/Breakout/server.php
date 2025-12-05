<?php


// Questo file è fatto con l'AI e serve per poter salvare i punteggi nella leaderboard


// Permetti richieste dal browser
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$file = __DIR__ . '/Assets/leaderboard.txt';

// Se è una richiesta POST (salvataggio)
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leggi i dati inviati dal gioco
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Prendi i dati
    $nome = isset($data['nome']) ? trim($data['nome']) : '';
    $punteggio = isset($data['punteggio']) ? intval($data['punteggio']) : 0;
    $leaderboard = isset($data['leaderboard']) ? $data['leaderboard'] : '';
    
    // Se hai ricevuto la classifica già ordinata dal client
    if(!empty($leaderboard)) {
        // Sovrascrivi il file con la nuova classifica
        file_put_contents($file, $leaderboard);
        echo json_encode(['success' => true]);
    } 
    // Altrimenti aggiungi e ordina qui sul server
    else if(!empty($nome) && $punteggio > 0) {
        // Leggi la classifica esistente
        $lines = [];
        if(file_exists($file)) {
            $content = file_get_contents($file);
            $lines = explode("\n", trim($content));
            $lines = array_filter($lines, function($line) {
                return !empty(trim($line));
            });
        }
        
        // Aggiungi il nuovo punteggio
        $lines[] = "$nome $punteggio";
        
        // Ordina dal più alto al più basso
        usort($lines, function($a, $b) {
            $partsA = explode(' ', $a);
            $partsB = explode(' ', $b);
            $scoreA = intval(end($partsA));
            $scoreB = intval(end($partsB));
            return $scoreB - $scoreA; // Decrescente
        });
        
        // Salva nel file
        file_put_contents($file, implode("\n", $lines));
        echo json_encode(['success' => true]);
    } 
    else {
        echo json_encode(['success' => false, 'error' => 'Dati mancanti']);
    }
} 
// Se è una richiesta GET (lettura)
else {
    // Leggi e restituisci il contenuto del file
    if(file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo ""; // File vuoto se non esiste
    }
}
?>