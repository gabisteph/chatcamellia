// ContactList.js
import React from 'react';
import { Link } from 'react-router-dom';

const ContactList = () => {
  // Obtenha a lista de contatos, por exemplo, de uma API ou de um estado local
  const contacts = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    // Adicione mais contatos conforme necessário
  ];

  return (
    <div>
      <h2>Contact List</h2>
      <ul>
        {contacts.map(contact => (
          <li key={contact.id}>
            <Link to={`/chat/${contact.id}`}>{contact.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
