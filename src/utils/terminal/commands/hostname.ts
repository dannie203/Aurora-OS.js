import { TerminalCommand } from '../types';

export const hostname: TerminalCommand = {
    name: 'hostname',
    description: 'Print system hostname',
    descriptionKey: 'terminal.commands.hostname.description',
    execute: () => {
        return { output: ['aurora'] };
    },
};
