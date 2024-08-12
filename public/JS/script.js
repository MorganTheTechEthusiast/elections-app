    // Fetch total registered voters from API and update the UI
    document.addEventListener('DOMContentLoaded', function () {
        fetch('/api/total-registered-voters')
            .then(response => response.json())
            .then(data => {
                document.querySelector('.voters-info p strong').textContent = data.totalVoters;
            })
            .catch(error => console.error('Error fetching total registered voters:', error));
    });

