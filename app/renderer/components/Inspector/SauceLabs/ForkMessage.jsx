import React from 'react';

const ForkMessage = () => {
  return (
    <div
      style={{
        position: 'absolute',
        right: -50,
        top: 30,
        padding: 5,
        textAlign: 'center',
        background: 'red',
        color: '#fff',
        fontSize: 10,
        transform: 'rotate(45deg)',
        width: 200,
      }}
    >
      <span>
        This is a <br />
        Sauce Labs specific fork.
      </span>
    </div>
  );
};

export default ForkMessage;
