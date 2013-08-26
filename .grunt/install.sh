echo "Installing gems"
gem install sass-globbing
echo "Installing grunt"
npm install -g grunt
npm install -g grunt-cli
echo "Installing npm dependencies"
npm install coffee # @todo: nec?
npm install
echo "To watch this project, just navigate to the .assist folder and execute the command \"grunt\" this will activate compass on the project."
