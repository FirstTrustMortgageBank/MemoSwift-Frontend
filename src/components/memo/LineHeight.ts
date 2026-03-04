import { Extension } from '@tiptap/core'

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultHeight: '1.5',
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultHeight,
            parseHTML: element => element.style.lineHeight || this.options.defaultHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {}
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight: (height) => ({ commands }) => {
        return this.options.types.every((type: string) => 
          commands.updateAttributes(type, { lineHeight: height })
        )
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every((type: string) => 
          commands.resetAttributes(type, 'lineHeight')
        )
      },
    }
  },
})