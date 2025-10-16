// Premier test simple pour comprendre Jest
// Ce fichier teste des fonctions basiques

// Test d'une fonction simple
function addition(a, b) {
  return a + b;
}

// Test d'une fonction avec validation
function validerEmail(email) {
  return email.includes('@') && email.includes('.');
}

// ===== LES TESTS COMMENCENT ICI =====

describe('Mes premiers tests', () => {
  
  // Test 1 : Fonction addition
  test('addition devrait retourner la somme de deux nombres', () => {
    // Arrange (Préparer)
    const a = 2;
    const b = 3;
    
    // Act (Agir)
    const resultat = addition(a, b);
    
    // Assert (Vérifier)
    expect(resultat).toBe(5);
  });

  // Test 2 : Fonction validation email
  test('validerEmail devrait accepter un email valide', () => {
    // Arrange
    const emailValide = 'test@example.com';
    
    // Act
    const resultat = validerEmail(emailValide);
    
    // Assert
    expect(resultat).toBe(true);
  });

  test('validerEmail devrait rejeter un email invalide', () => {
    // Arrange
    const emailInvalide = 'email-sans-arobase';
    
    // Act
    const resultat = validerEmail(emailInvalide);
    
    // Assert
    expect(resultat).toBe(false);
  });
});
