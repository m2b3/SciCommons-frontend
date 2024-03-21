describe('Home Screen', () => {
  beforeEach(() => {
    // Assuming your local development server is running on port 3000
    cy.visit('http://localhost:3000');
  });

  it('displays the welcome message and Get Started button', () => {
    cy.contains('Welcome to SciCommons');
    cy.contains('An open peer review platform for efficient and anonymous article reviewal.');

    // Button text
    cy.contains('Get Started');
  });
});
