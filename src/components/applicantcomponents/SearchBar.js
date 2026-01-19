import React, { useState, useEffect } from 'react';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const handleSearch = () => {
      const elements = document.querySelectorAll('*:not(script):not(style)');
      const results = [];

      elements.forEach((element) => {
        const text = element.innerText || element.textContent;
        if (text && text.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(element);
        }
      });

      setSearchResults(results);
    };

    handleSearch();
  }, [searchTerm]);
  
  return (
    <div>
      <input
        type="text"
        placeholder="Search the page..."
        value={searchTerm}
        onChange={handleInputChange}
      />
      {searchResults.length > 0 && (
        <div>
          <p>Search Results:</p>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>{result.innerText}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default SearchBar;
