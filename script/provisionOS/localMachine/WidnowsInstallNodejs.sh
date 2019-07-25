if ! grep -q Microsoft /proc/version && ! grep -q Linux /proc/version; then
  refreshenv # update path commands

  if hash node 2>/dev/null; then
    echo '✔ nodejs is installed.'
  else
    if hash choco 2>/dev/null && hash nodejs 2>/dev/null; then
      echo 'Using `choco` to install.'
      choco install nodejs -y
    elif hash scoop 2>/dev/null && hash nodejs 2>/dev/null; then
      echo 'Using `scoop` to install.'
      scoop install nodejs -y
    else 
      echo 'Failed to install `nodejs` as `scoop` or `choco` windows package managers are not installed.'
    fi
    refreshenv # refresh path commands
  fi


  if hash yarn 2>/dev/null; then
    echo '✔ yarn is installed.'
  else
    if hash choco 2>/dev/null; then
      echo 'Using `choco` to install.'
      choco install yarn -y  
    elif hash scoop 2>/dev/null; then
      echo 'Using `scoop` to install.'
      scoop install yarn -y
    else 
      echo 'Failed to install `yarn` as `scoop` or `choco` windows package managers are not installed.'
    fi
    refreshenv # refresh path commands
  fi

else
  echo "Not a Windows OS environment."
  exit 1
fi